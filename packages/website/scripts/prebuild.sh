#!/bin/sh

## used for docs
## create .env file if it does not exist
filename=.env
test -f $filename || touch $filename

## put deploy date on .env file
echo "\n"NEXT_PUBLIC_DEPLOYDATE=`date +%m/%d/%Y` >> $filename
