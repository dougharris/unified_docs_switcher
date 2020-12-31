# Unified Docs Switcher

A browser extension that remembers which version of documentation you're using for programming languages, frameworks, databases, etc.

The problem this solves:

1. Forget the syntax for Django query filters.
2. Search google for "django query filters".
3. Click on the link for official Django documentation.
4. Notice that it's showing documentation for version 3.1 but you're using 2.2.
   It's _probably_ the same syntax, but you've been doing this long enough to know better, so...
5. Click to see the 2.2 version.

Twenty minutes later, you want to check the syntax for Django urls... repeat the same process. And then for Python regular expressions or PostgreSQL constraints.

Wouldn't it be nice if you were automatically seeing your version every time? That's what this extension helps with.

This was inspired by [django docs version switcher](https://github.com/jmckib/django_docs_version_switcher) and [py3redirect](https://github.com/m4tx/py3redirect).

## Platforms

This extension currently works for the following platforms' documentation:

* Django - https://docs.djangoproject.com/
* PostgreSQL - https://www.postgresql.org/docs
* Python - https://docs.python.org/

Want a new one added? [Let me know](https://github.com/dougharris/unified_docs_switcher/issues/new?assignees=&labels=new+docs+platform&template=new-documentation-platform.md&title=). See how Django handles this for text links or how Python handles this for a select list in the `docsData` array [in the code](https://github.com/dougharris/unified_docs_switcher/blob/main/background.js).

## Usage

Just browse. Whenever you explicitly change versions on one of the sites, your preferred version is stored. When you next visit a page on that documentation site, you'll be redirected to your preferred version if not already there.

## Install

The extension is available on:
* Chrome Web Store - search for ["unified docs switcher"](https://chrome.google.com/webstore/search/unified%20docs%20switcher?hl=en)
* Firefox Addons - search for ["unified docs switcher"](https://addons.mozilla.org/en-US/firefox/search/?platform=mac&q=unified%20docs%20switcher)


## Bugs & Feature Requests

Add an [issue on the Github repo](https://github.com/dougharris/unified_docs_switcher/issues). 

If you'd like to see a new documentation site handled by this extension, add a [new issue with the "new docs template" label](https://github.com/dougharris/unified_docs_switcher/issues/new?assignees=&labels=new+docs+platform&template=new-documentation-platform.md&title=)
