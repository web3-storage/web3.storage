#!/bin/sh

## Check to see if we're running from packages/website, and if so, change two levels up the tree
pwd
[[ "$PWD" =~ website ]] && cd ../..

## create .env file if it does not exist
ls -l
filename=packages/website/.env
test -f $filename || touch $filename
ls -l

## put deploy date on .env file
echo "\n"NEXT_PUBLIC_DEPLOYDATE=`date +%m/%d/%Y` >> $filename