const docsData = {
    django: {
        version: "3.1",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/",
        versionSelector: "ul#doc-versions a"
    },
    python: {
        version: "3.9",
        urls: "https://docs.python.org/*",
        pattern: "docs.python.org/(?<version>[23][^/]*?)/",
        versionSelector: ".version_switcher_placeholder select"
    },
    postgresql: {
        version: "current",
        urls: "https://www.postgresql.org/docs/*",
        pattern: "www.postgresql.org/docs/(?<version>[0-9]+(\.[0-9]+)*|devel|current)/",
        versionSelector: '.mb-2 a[href*="DOCSTUB"], .alert-warning a[href*="DOCSTUB"]'
    }
};

let redirector = (function() {
    let preferredVersions = {};

    let debug = true;
    let debugMsg = function(msg) {
        if (debug) { console.debug(msg); }
    };

    let platform = '';
    let match = null;

    let setDefaultVersions = function() {
        debugMsg("Setting default versions");
        for (let p in docsData) {
            if (!(p in preferredVersions)) {
                debugMsg(`${p} not stored, adding`);
                preferredVersions[p] = docsData[p].version;
            }
        }
        browser.storage.local.set({'preferredVersions': preferredVersions});
    };

    let identifyPlatform = function(originUrl) {
        // Determine which platform we're using
        for (let p in docsData) {
            debugMsg(`Checking ${p}`);
            regexp = RegExp(docsData[p].pattern);
            match = regexp.exec(originUrl);
            if (match) {
                platform = p;
                break;
            }
        }
        debugMsg(`Identified platform: ${platform}.`);
    };

    let loadPreferredVersions = function() {
        debugMsg("Loading preferred versions");
        browser.storage.local.get('preferredVersions').then(
            function(items) {
                if (Object.keys(items).length == 0) {
                    setDefaultVersions();
                }
                for (let p in items) {
                    preferredVersions = items.preferredVersions;
                }
            });
    };

    // send information to content script that is needed to set up event handler
    let sendSiteInfo = function(requests, sender, sendResponse) {
        sendResponse({response: {
            platform: platform,
            selector: docsData[platform].versionSelector
        }});
    };

    let redirectDocs = function(originUrl) {
        let regexp;
        let redirectUrl = '';

        identifyPlatform(originUrl);

        // Determine if this page's version matches my preferred version
        let myVersion = preferredVersions[platform];
        if (!myVersion) {
            debugMsg(`Couldn't find ${platform} version`);
            setDefaultVersions();
        }

        let thisVersion = match.groups.version;
        debugMsg(`Matched ${platform} version ${match.groups.version} `);
        if (thisVersion != myVersion) {
            redirectUrl = originUrl.replace(thisVersion, myVersion);
            debugMsg(`Redirecting to version ${myVersion} to ${redirectUrl}`);
        }
        if (redirectUrl) {
            browser.storage.local.set({'redirectedVersion': myVersion});
            return { redirectUrl: redirectUrl };
        } else {
            return {};
        }
    };

    let setNewVersion = function(platform, version) {
        debugMsg(`Setting ${platform} to ${version}`);
        preferredVersions[platform] = version;
        browser.storage.local.set({'preferredVersions': preferredVersions});
    };

    return {
        beforeRequestListener: function(details) {
            return redirectDocs(details.url);
        },
        init: function() {
            loadPreferredVersions();
        },
        messageHandler(request, sender, sendResponse) {
            switch (request.content) {
                case 'send-info':
                    sendSiteInfo(request, sender, sendResponse);
                    break;
                case 'set-version':
                    setNewVersion(request.platform, request.newVersion);
                    break;
                default:
                    debugMsg(`Unknown message received: ${request.content}.`);
            }
        },
        showStoredVersions: function() {
            let output = '';
            for (let p in preferredVersions) {
                output = output + `\t${p}: ${preferredVersions[p]}\n`;
            }
            debugMsg(`Preferred versions:\n${output}`);
        },
        setTestVersion: function(platform, version) {
            setNewVersion(platform, version);
        }

    };
})();

redirector.init();

let urlPatterns = [];
for (let key in docsData) {
    urlPatterns.push(docsData[key].urls);
}
console.log(`Unified Doc Switcher extension will redirect for: ${urlPatterns}`);

browser.webRequest.onBeforeRequest.addListener(
    redirector.beforeRequestListener,
    { urls: urlPatterns, types: ["main_frame"] },
    ["blocking"]
);

browser.runtime.onMessage.addListener(redirector.messageHandler);
