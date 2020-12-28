const docsData = {
    django: {
        version: "3.1",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/"
    },
    python: {
        version: "3.9",
        urls: "https://docs.python.org/*",
        pattern: "docs.python.org/(?<version>[23][^/]*?)/"
    },
    postgresql: {
        version: "current",
        urls: "https://www.postgresql.org/docs/*",
        pattern: "www.postgresql.org/docs/(?<version>[0-9]+\.[0-9]+|devel|current)/"
    }
};

let redirector = (function() {
    let preferredVersions = {};

    let debug = true;
    let debugMsg = function(msg) {
        if (debug) {
            console.log(msg);
        }
    };

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

    let redirectDocs = function(originUrl) {
        let regexp;
        let match = null;
        let platform = '';
        let redirectUrl = '';

        debugMsg(`Attemptying to redirect ${originUrl}`);
        // Determine which platform we're using
        for (let p in docsData) {
            debugMsg(`Checking ${p}`);
            regexp = RegExp(docsData[p].pattern);
            match = regexp.exec(originUrl);
            if (match) {
                debugMsg(`Matched ${p}`);
                platform = p;
                break;
            }
        }
        debugMsg(`Redirecting for ${platform}.`);

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
            debugMsg(`listener redirecting.`);
            return { redirectUrl: redirectUrl };
        } else {
            return {};
        }
    };
    

    return {
        listener: function(details) {
            return redirectDocs(details.url);
        },
        loadPreferredVersions: function() {
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
        },
        showStoredVersions: function() {
            let output = '';
            for (let p in preferredVersions) {
                output = output + `\t${p}: ${preferredVersions[p]}\n`;
            }
            debugMsg(`Preferred versions:\n${output}`);
        },
        setTestVersion: function(platform, version) {
            debugMsg(`Setting ${platform} to ${version}`);
            preferredVersions[platform] = version;
            browser.storage.local.set({'preferredVersions': preferredVersions});
        }

    };
})();

redirector.loadPreferredVersions();


// DEBUG patterns used
let urlPatterns = [];

for (let key in docsData) {
    urlPatterns.push(docsData[key].urls);
}
console.log(`Will redirect for: ${urlPatterns}`);

   
browser.webRequest.onBeforeRequest.addListener(
    redirector.listener,
    { urls: urlPatterns, types: ["main_frame"] },
    ["blocking"]
);

