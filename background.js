const docsData = {
    django: {
        version: "2.2",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\.[0-9]+|dev)/",
    },
    python: {
        version: "3.8",
        urls: "https://docs.python.org/*",
        pattern: "^(https?:\/\/docs\.python\.org\/)(?<version>[23][^\/]*?)(\/.*)"
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

    let redirectDocs = function(originUrl, platform) {
        console.log(`Redirecting for ${platform}.`);
        let versionKey = `${platform}_version`;
        let myVersion = preferredVersions[platform];
        let myInfo = docsData[platform];
        let regexp = new RegExp(myInfo.pattern);
        let match = regexp.exec(originUrl);
        let thisVersion = match.groups.version;
        let redirectUrl = '';
        if (!myVersion) {
            console.log(`Couldn't find ${platform} version`);
        }
        console.log(`Matched ${platform} version ${match.groups.version} `);
        if (thisVersion != myVersion) {
            redirectUrl = originUrl.replace(thisVersion, myVersion);
            console.log(`Redirecting to version ${myVersion} to ${redirectUrl}`);
        }
        return redirectUrl;
    };
    

    return {
        listener: function(details) {
            let originUrl = details.url;
            let redirectUrl = '';
            if (originUrl.includes("django")) {
                redirectUrl = redirectDocs(originUrl, "django");
            } else if (thisVersionUrl.includes("python")) {
                let myInfo = docsData.python;
                let regexp = new RegExp(myInfo.pattern);
                let match = regexp.exec(thisVersionUrl);
                console.log(`Matched python version ${match.groups.version} `);
            }
            if (redirectUrl) {
                console.log(`listener redirecting.`);
                return { redirectUrl: redirectUrl };
            } else {
                return {};
            }
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

