---
name: New documentation platform
about: Add a new documenation site to be handled by this extension
title: ''
labels: new docs platform
assignees: ''

---

Please fill out as much of this as you can. The platform name and base URL are the minimum required.

**Platform name** (e.g. "Django", "Ruby"):

**Example URL**:

**Base URL** controls which URLs the extension will be active for, e.g. `https://docs.djangoproject.com/*`:

**Documentation pattern** a regular expressionthat identifies the version indicator in the URL path, e.g. for django, it's `docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/`

**Version selector on page** the CSS selector for the link or select list to change versions, e.g. for django, it's `ul#doc-versions a`:
