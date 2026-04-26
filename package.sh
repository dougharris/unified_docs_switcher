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

COMMON_FILES="background.js content-script.js doc-switcher.css books.png books48.png"

# Create zip file for Chrome
echo "Packaging for chrome:"
zip -r -FS chrome/unified_doc_switcher.zip manifest.json \
    $COMMON_FILES \
    popup

# Create zip file for Firefox using manifest-firefox.json as manifest.json
echo "Packaging for firefox:"
SRCDIR="$PWD"
FFDIR=$(mktemp -d)
trap "rm -rf $FFDIR" EXIT
cp manifest-firefox.json "$FFDIR/manifest.json"
cp $COMMON_FILES "$FFDIR/"
cp -r popup "$FFDIR/"
(cd "$FFDIR" && zip -r -FS "$SRCDIR/firefox/unified_doc_switcher.zip" .)
