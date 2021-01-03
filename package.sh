#!/usr/bin/env bash

# Dumb check to make sure we're in the right directory
if [[ ! -a manifest.json || ! -a doc-switcher.css || ! -a books.svg ]]
then
    echo "Some files missing... are you in the right directory?"
    exit 1
fi

# Only package if manifest.json is clean
git status manifest.json | grep -q manifest
if [[ $? -eq 0 ]]
then
    echo "Commit changes to manifest.json before continuing."
    exit
fi

mkdir -p chrome
mkdir -p firefox

# Create zip file for Chrome
zip -FS chrome/unified_doc_switcher.zip manifest.json \
    background.js \
    books.svg \
    browser-polyfill.min.js \
    browser-polyfill.min.js.map \
    content-script.js \
    doc-switcher.css 


# Add app id info for Firefox
gsed -i '/author/r add-on-id.txt' manifest.json

# Create zip file for Firefox
zip -FS firefox/unified_doc_switcher.zip manifest.json \
    background.js \
    books.svg \
    browser-polyfill.min.js \
    browser-polyfill.min.js.map \
    content-script.js \
    doc-switcher.css 

# Undo manifest change
git checkout manifest.json
