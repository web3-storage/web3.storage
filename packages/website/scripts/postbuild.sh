#!/bin/sh

## rename 404.html/index.html to 404.html since cloudflare pages needs it to be 404.html
rm -rf out/404.html && cp out/404/index.html out/404.html

## clean up deploydate that was set in prebuild
sed -i '' '/^NEXT_PUBLIC_DEPLOYDATE/d' .env 
sed -i '' '/^$/d' .env 