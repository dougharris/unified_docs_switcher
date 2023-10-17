const docsData = {
    django: {
        version: "3.1",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/",
        versionSelector: "ul#doc-versions a"
    },
    python: {
        version: "3",
        urls: "https://docs.python.org/*",
        pattern: "docs.python.org/(?<version>[23][^/]*?)/",
        versionSelector: ".version_switcher_placeholder select"
    },
    postgresql: {
        version: "current",
        urls: "https://www.postgresql.org/docs/*",
        pattern: "www.postgresql.org/docs/(?<version>[0-9]+(\.[0-9]+)*|devel|current)/",
        versionSelector: '.mb-2 a[href*="DOCSTUB"], .alert-warning a[href*="DOCSTUB"]'
    },
    celery: {
        version: "stable",
        urls: "https://docs.celeryq.dev/*",
        pattern: "docs.celeryq.dev/en/(?<version>stable|master|latest|v?[0-9](\.[0-9]+)*(-archived)?)/",
        versionSelector: '.rst-other-versions dd a'
    },
    wagtail: {
        version: "stable",
        urls: "https://docs.wagtail.org/*",
        pattern: "docs.wagtail.org/en/(?<version>stable|master|latest|v?[0-9](\.[0-9]+)*(-archived)?)/",
        versionSelector: '.rst-other-versions dd a'
    },
};

let storage = browser.storage.sync;

let redirector = (function() {
    let preferredVersions = {};

    let debug = false;
    let debugMsg = function(msg) {
        if (debug) { console.debug(`%c ${msg}`, 'font-size: 15px; color: #090;'); }
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
        storage.set({'preferredVersions': preferredVersions});
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
        storage.get('preferredVersions').then(
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
        let thisVersion = match.groups.version;

        let myVersion = preferredVersions[platform];
        if (!myVersion) {
            debugMsg(`Couldn't find ${platform} version`);
            if (platform in docsData) {
                // New platform for this user? Set the default
                setDefaultVersions();
                myVersion = preferredVersions[platform];
            } else {
                // Some other reason not saved? Use the current page's version
                myVersion = thisVersion;
            }
        }

        debugMsg(`Matched ${platform} version ${thisVersion} `);
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
        if (platform == 'all') {
            debugMsg(`Setting all to default values`);
            preferredVersions = {};
            setDefaultVersions();
        } else {
            debugMsg(`Setting ${platform} to ${version}`);
            preferredVersions[platform] = version;
            storage.set({'preferredVersions': preferredVersions});
        }
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
            console.log(`Preferred versions:\n${output}`);
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
