-- Ran a few stats in staging (data should be comparable to prod)
-- # pins 198.607.016
-- # Remote pins: 131.495.153
-- % To be removed: ~66%

-- Concern: Is deleting a few hundred millions rows in Prod affecting performance?
-- Research:
-- According to documentation https://www.postgresql.org/docs/7.2/locking-tables.html deleting rows should use a 
-- `RowExclusiveLock`. 
-- This could have a negative performance impact in case those rows are being updated by other queries.
-- However in our specific case I don't think remote pin are being really ever touched so it should be safe to just run 
-- the query.
-- Not sure about what statement_timeout we have in prod? Could that be a problem?
--
-- Alternative approach would be to create a cron job and delete in batches.

DELETE FROM pin WHERE status='Remote'
