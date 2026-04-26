# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unified Docs Switcher is a browser extension (Manifest V2) that intercepts HTTP requests to documentation sites and redirects to the user's preferred version. It supports Chrome and Firefox via Mozilla's browser-polyfill.

## Building

```bash
./package.sh
```

This creates zip files in `chrome/` and `firefox/` directories. The script performs pre-flight checks (debug flags, storage mode, manifest cleanliness) and temporarily patches `manifest.json` for Firefox packaging.

There is no npm, no build system, and no test framework — this is vanilla JavaScript.

## Architecture

The extension has three distinct execution contexts that communicate via message passing:

**Background script** (`background.js`) — runs persistently, owns all state:
- Holds `docsData` object defining all supported platforms (URL patterns, default versions, DOM selectors)
- Intercepts HTTP requests via `browser.webRequest.onBeforeRequest` with "blocking" to redirect before the page loads
- Stores user version preferences in `browser.storage.sync`
- Responds to messages from content scripts with platform info

**Content script** (`content-script.js`) — injected into matching doc pages:
- Receives platform info from background via `browser.runtime.sendMessage`
- Attaches click/change listeners to the version selector element (may use MutationObserver for dynamic selectors)
- Shows a transient banner when a redirect occurred
- Sends version-change events back to background to persist the new preference

**Popup** (`popup/`) — rendered when user clicks the toolbar icon:
- Reads all stored preferences from `browser.storage.sync` and displays them in a table
- Provides a "Reset all to default versions" button

## Adding a New Documentation Platform

1. Add an entry to the `docsData` object in `background.js` with:
   - `version`: default version string
   - `urls`: glob pattern for manifest host permissions
   - `pattern`: regex with a named capture group `(?<version>...)` to extract version from URL
   - `versionSelector`: CSS selector for the version-switcher element on the page

2. Add the same `urls` glob to `manifest.json` and `manifest-firefox.json` in both `permissions` (host permissions) and `content_scripts.matches`.

3. Update `README.md` with the new platform.

## Cross-Browser Notes

- Uses `browser.*` APIs throughout (not `chrome.*`) — the polyfill (`browser-polyfill.min.js`) handles Chrome compatibility
- `manifest.json` is the Chrome manifest; `manifest-firefox.json` adds a Firefox-specific add-on ID — `package.sh` handles swapping them during Firefox packaging
- The extension is currently Manifest V2; migration to V3 (`declarativeNetRequest`) is a known future task
