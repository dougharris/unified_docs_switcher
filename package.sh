#!/usr/bin/env bash

#
# First some sanity checks
#
# Dumb check to make sure we're in the right directory
if [[ ! -a manifest.json || ! -a doc-switcher.css || ! -a books.svg ]]
then
    echo "===> Some files missing... are you in the right directory?"
    exit 1
fi

# Only package if manifest.json is clean
git status manifest.json | grep -q manifest
if [[ $? -eq 0 ]]
then
    echo "===> Commit changes to manifest.json before continuing."
    exit
fi

# Remember to change storage back to sync
grep -q 'storage = browser.storage.local' background.js popup/switcher-popup.js 
if [[ $? -eq 0 ]]
then
    echo "===> Change storage from local to sync before continuing."
    exit
fi

# Remember to change debug to false
grep 'debug = true' background.js content-script.js
if [[ $? -eq 0 ]]
then
    echo "===> Change debug to false before continuing."
    exit
fi

#
# Now make the packages
#
mkdir -p chrome
mkdir -p firefox

# Create zip file for Chrome
echo "Packaging for chrome:"
zip -r -FS chrome/unified_doc_switcher.zip manifest.json \
    background.js \
    browser-polyfill.min.js \
    browser-polyfill.min.js.map \
    content-script.js \
    doc-switcher.css \
    books.png \
    books48.png \
    popup

# Add app id info for Firefox
gsed -i '/author/r add-on-id.txt' manifest.json

# Create zip file for Firefox
echo "Packaging for firefox:"
zip -r -FS firefox/unified_doc_switcher.zip manifest.json \
    background.js \
    browser-polyfill.min.js \
    browser-polyfill.min.js.map \
    content-script.js \
    doc-switcher.css \
    books.png \
    books48.png \
    popup

# Undo manifest change
git checkout manifest.json
