const docsData = {
    django: {
        version: "2.2",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/",
    },
    python: {
        version: "3.8",
        urls: "https://docs.python.org/*",
        pattern: "docs.python.org/(?<version>[23][^/]*?)/"
    }
};



let redirector = (function() {
    let preferredVersions = {};

    let setDefaultVersions = function() {
        console.log("Setting default versions");
        preferredVersions = {
            "django": "1.11",
            "python": "3.8"
        };
        browser.storage.local.set({'preferredVersions': preferredVersions});
    };

    let redirectDocs = function(originUrl) {
        let regexp;
        let match = null;
        let platform = '';
        let redirectUrl = '';

        // Determine which platform we're using
        for (let p in docsData) {
            console.log(`Checking ${p}`);
            regexp = RegExp(docsData[p].pattern);
            match = regexp.exec(originUrl);
            if (match) {
                console.log(`Matched ${p}`);
                platform = p;
                break;
            }
        }
        console.log(`Redirecting for ${platform}.`);

        // Determine if this page's version matches my preferred version
        let myVersion = preferredVersions[platform];
        let thisVersion = match.groups.version;
        if (!myVersion) {
            console.log(`Couldn't find ${platform} version`);
        }
        console.log(`Matched ${platform} version ${match.groups.version} `);
        if (thisVersion != myVersion) {
            redirectUrl = originUrl.replace(thisVersion, myVersion);
            console.log(`Redirecting to version ${myVersion} to ${redirectUrl}`);
        }
        if (redirectUrl) {
            console.log(`listener redirecting.`);
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
            console.log("Loading preferred versions");
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
            console.log(`Preferred versions:\n${output}`);
        },
        setTestVersion: function(platform, version) {
            console.log(`Setting ${platform} to ${version}`);
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

