#!/bin/bash
#
# Builds Docusaurus site and then moves it into the Next Zone for /docs in the packages/website workspace.

## Check to see if we're running from packages/website, and if so, change two levels up the tree
pwd
[[ "$PWD" =~ website ]] && cd ../..
mkdir -p packages/website/out/docs

## Build Docusaurus site from workspace
echo -e "Building Docusaurus site...\n"
npm run build -w packages/docs

## Move Docusaurus site to `packages/website/out/docs`, which is accessible using the Next Zone
echo -e "Moving Docusaurus site...\n"
cp -vfr packages/docs/build/* packages/website/out/docs
