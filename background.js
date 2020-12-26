let docsData = {
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


function listener(details) {
    let thisVersionUrl = details.url;
    let redirectUrl = '';
    if (thisVersionUrl.includes("django")) {
        let myInfo = docsData.django;
        let regexp = new RegExp(myInfo.pattern);
        let match = regexp.exec(thisVersionUrl);
        let thisVersion = match.groups.version;
        console.log(`Matched django version ${match.groups.version} `);
        if (thisVersion != myInfo.version) {
            redirectUrl = thisVersionUrl.replace(thisVersion, myInfo.version);
            console.log(`Redirecting to version ${myInfo.version} to ${redirectUrl}`);
        }
    } else if (thisVersionUrl.includes("python")) {
        let myInfo = docsData.python;
        let regexp = new RegExp(myInfo.pattern);
        let match = regexp.exec(thisVersionUrl);
        // let thisVersion = 
        console.log(`Matched python version ${match.groups.version} `);
    }
    if (redirectUrl) {
        return { redirectUrl: redirectUrl };
    } else {
        return {};
    }
}


var urlPatterns = [];

for (var key in docsData) {
    urlPatterns.push(docsData[key].urls);
    console.log(`A: URL patterns ${urlPatterns}`);
}
console.log(`URL patterns ${urlPatterns}`);
    
browser.webRequest.onBeforeRequest.addListener(
    listener,
    { urls: urlPatterns, types: ["main_frame"] },
    ["blocking"]
);
