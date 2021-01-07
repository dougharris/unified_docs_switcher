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

Would you like to see it in action? Watch [this video](https://youtu.be/z2hHxXpTFfE).

This was inspired by [django docs version switcher](https://github.com/jmckib/django_docs_version_switcher) and [py3redirect](https://github.com/m4tx/py3redirect).

## Platforms

This extension currently works for the following platforms' documentation:

* Celery - https://docs.celeryproject.org/
* Django - https://docs.djangoproject.com/
* PostgreSQL - https://www.postgresql.org/docs
* Python - https://docs.python.org/

Want a new one added? [Let me know](https://github.com/dougharris/unified_docs_switcher/issues/new?assignees=&labels=new+docs+platform&template=new-documentation-platform.md&title=). See how Django handles this for text links or how Python handles this for a select list in the `docsData` array [in the code](https://github.com/dougharris/unified_docs_switcher/blob/main/background.js#L2-L13).

## Usage

Just browse. Whenever you explicitly change versions on one of the sites, your preferred version is stored. When you next visit a page on that documentation site, you'll be redirected to your preferred version if not already there.

## Install

The extension is available on:
* [Chrome Web Store](https://chrome.google.com/webstore/detail/unified-docs-switcher/egmbedhkleiholijlmnlhgcflooajdnb/)
* [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/unified-docs-switcher/)


## Bugs & Feature Requests

Add an [issue on the Github repo](https://github.com/dougharris/unified_docs_switcher/issues). 

If you'd like to see a new documentation site handled by this extension, add a [new issue with the "new docs template" label](https://github.com/dougharris/unified_docs_switcher/issues/new?assignees=&labels=new+docs+platform&template=new-documentation-platform.md&title=)

## Attribution

Icon by [BECRIS](https://freeicons.io/profile/3484) on [freeicons.io](https://freeicons.io).
