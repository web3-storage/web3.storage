#!/bin/bash
#
# rename 404.html/index.html to 404.html since cloudflare pages needs it to be 404.html
rm -rf packages/website/out/404.html && cp packages/website/out/404/index.html packages/website/out/404.html