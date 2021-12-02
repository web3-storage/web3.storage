# Generate an API key at https://dashboard.heroku.com/account/applications
# Use your usual email address and API key for password.
heroku login --interactive

# PostgreSQL ###################################################################

# Create empty apps for staging and production
heroku apps:create web3-storage-staging --team=web3-storage
heroku apps:create web3-storage-prod --team=web3-storage

# # Add PostgreSQL databases
heroku addons:create heroku-postgresql:premium-4 --app=web3-storage-staging --name=web3-storage-staging-0
heroku addons:create heroku-postgresql:premium-4 --app=web3-storage-prod --name=web3-storage-prod-0

# Add replica
heroku addons:create heroku-postgresql:premium-4 --app=web3-storage-prod --name=web3-storage-replica-0 --follow $(heroku config:get DATABASE_URL --app=web3-storage-prod)

# Add schema
heroku pg:psql web3-storage-staging-0 --app=web3-storage-staging
# ...run schema SQL from /packages/db/tables.sql
# ...run schema SQL from /packages/db/fdw.sql with credentials replaced
# ...run schema SQL from /packages/db/cargo.sql
# ...run schema SQL from /packages/db/functions.sql
heroku pg:psql web3-storage-prod-0 --app=web3-storage-prod
# ...run schema SQL from /packages/db/tables.sql
# ...run schema SQL from /packages/db/fdw.sql with credentials replaced
# ...run schema SQL from /packages/db/cargo.sql
# ...run schema SQL from /packages/db/functions.sql

# PostgREST ####################################################################

# Create PostgREST staging and production apps and connect them to staging/production DBs
# https://elements.heroku.com/buildpacks/postgrest/postgrest-heroku
# (App name has 30 char limit)
heroku apps:create web3-storage-pgrest-staging --buildpack https://github.com/PostgREST/postgrest-heroku --team=web3-storage
heroku apps:create web3-storage-pgrest-prod --buildpack https://github.com/PostgREST/postgrest-heroku --team=web3-storage

# Bump dyno sizes
heroku dyno:resize web=standard-1x --app web3-storage-pgrest-staging
heroku dyno:resize web=standard-2x --app web3-storage-pgrest-prod

# Create the web_anon, authenticator and web3_storage credentials
# (Heroku does not allow this to be done in the DB)
# Note that by default the created credential has NO PRIVILEGES
heroku pg:credentials:create web3-storage-staging-0 --name=web_anon --app=web3-storage-staging
heroku pg:credentials:create web3-storage-staging-0 --name=authenticator --app=web3-storage-staging
heroku pg:credentials:create web3-storage-staging-0 --name=web3_storage --app=web3-storage-staging

heroku pg:credentials:create web3-storage-prod-0 --name=web_anon --app=web3-storage-prod
heroku pg:credentials:create web3-storage-prod-0 --name=authenticator --app=web3-storage-prod
heroku pg:credentials:create web3-storage-prod-0 --name=web3_storage --app=web3-storage-prod

# Grant privileges to PostgREST DB users
# https://postgrest.org/en/stable/tutorials/tut0.html
# https://postgrest.org/en/stable/tutorials/tut1.html
heroku pg:psql web3-storage-staging-0 --app=web3-storage-staging < grant-postgrest.sql
heroku pg:psql web3-storage-prod-0 --app=web3-storage-prod < grant-postgrest.sql

# Configure the DB_URI and JWT_SECRET for PostgREST
heroku config:set DB_URI=$(heroku config:get DATABASE_URL --app=web3-storage-staging) --app=web3-storage-pgrest-staging
heroku config:set DB_URI=$(heroku config:get DATABASE_URL --app=web3-storage-prod) --app=web3-storage-pgrest-prod
# Obtain secret from 1password vault!
heroku config:set JWT_SECRET="supersecret" --app=web3-storage-pgrest-staging
heroku config:set JWT_SECRET="supersecret" --app=web3-storage-pgrest-prod

# Deploy
cd postgrest/
git init
git add -A
git commit -m "chore: configure postgrest"

heroku git:remote --app=web3-storage-pgrest-staging
git push heroku main
heroku git:remote --app=web3-storage-pgrest-prod
git push heroku main
# go back to heroku directory
cd ..

# Custom domains
heroku domains:add db-staging.web3.storage --app=web3-storage-pgrest-staging
heroku domains:add db.web3.storage --app=web3-storage-pgrest-prod
# DNS records need to be added to cloudflare with the returned DNS target

# SSL certs
heroku certs:auto:enable --app=web3-storage-pgrest-staging
heroku certs:auto:enable --app=web3-storage-pgrest-prod

# dagcargo #####################################################################

# Add dagcargo user
heroku pg:credentials:create web3-storage-staging-0 --name=dagcargo --app=web3-storage-staging
heroku pg:credentials:create web3-storage-prod-0 --name=dagcargo --app=web3-storage-prod

# Grant privileges to dagcargo user
heroku pg:psql web3-storage-staging-0 --app=web3-storage-staging < grant-dagcargo.sql
heroku pg:psql web3-storage-prod-0 --app=web3-storage-prod < grant-dagcargo.sql

# stats ########################################################################

# Add stats user for ad-hoc reporting (only needs production access)
heroku pg:credentials:create web3-storage-prod-0 --name=stats --app=web3-storage-prod

# Grant RO privileges to stats user
heroku pg:psql web3-storage-prod-0 --app=web3-storage-prod < grant-stats.sql
