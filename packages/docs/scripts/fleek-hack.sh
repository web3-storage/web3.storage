#!/usr/bin/env bash

# this is a silly hack to get Fleek to find the docusaurus build output
# Once we've merged the docusaurus PR, we can change the Fleek config and remove this

# change to repo root dir
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "${SCRIPT_DIR}/.."

# make a symlink from old vuepress output dir to build dir
mkdir -p ./docs/.vuepress
ln -s ${PWD}/build ./docs/.vuepress/dist