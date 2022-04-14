#!/bin/sh

## create .env file if it does not exist
ls -l
filename=.env
test -f $filename || touch $filename
ls -l

## put deploy date on .env file
echo "\n"NEXT_PUBLIC_DEPLOYDATE=`date +%m/%d/%Y` >> $filename