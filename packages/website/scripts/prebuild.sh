#!/bin/sh

## Check to see if we're running from packages/website, and if so, change two levels up the tree
pwd
[[ "$PWD" =~ website ]] && cd ../..

## create .env file if it does not exist
filename=./packages/website/.envSZ
test -f $filename || touch $filename

## put deploy date on .env file
echo "\n"NEXT_PUBLIC_DEPLOYDATE=`date +%m/%d/%Y` >> $filename