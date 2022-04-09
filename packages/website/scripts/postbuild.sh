#!/bin/sh

## Check to see if we're running from packages/website, and if so, change two levels up the tree
pwd
[[ "$PWD" =~ website ]] && cd ../..

## rename 404.html/index.html to 404.html since cloudflare pages needs it to be 404.html
rm -rf packages/website/out/404.html && cp packages/website/out/404/index.html packages/website/out/404.html

## clean up deploydate that was set in prebuild
sed -i '' '/^NEXT_PUBLIC_DEPLOYDATE/d' ./packages/website/.env
sed -i '' '/^$/d' ./packages/website/.env