const browser = globalThis.browser ?? globalThis.chrome;

const docsData = {
    django: {
        version: "3.1",
        urls: "https://docs.djangoproject.com/*",
        pattern: "docs.djangoproject.com/[^/]*/(?<version>[0-9]+\\.[0-9]+|dev)/",
        versionSelector: "ul#doc-versions a",
        ruleId: 1,
        // Capture groups: 1=lang-segment, 2=path-after-version
        regexFilter: "^https://docs\\.djangoproject\\.com/([^/]+)/[^/]+(/.*)$",
        buildSubstitution: v => `https://docs.djangoproject.com/\\1/${v}\\2`,
    },
    python: {
        version: "3",
        urls: "https://docs.python.org/*",
        pattern: "docs.python.org/(?<version>[23][^/]*?)/",
        versionSelector: ".version_switcher_placeholder select",
        ruleId: 2,
        // Capture group: 1=path-after-version
        regexFilter: "^https://docs\\.python\\.org/[^/]+(/.*)$",
        buildSubstitution: v => `https://docs.python.org/${v}\\1`,
    },
    postgresql: {
        version: "current",
        urls: "https://www.postgresql.org/docs/*",
        pattern: "www.postgresql.org/docs/(?<version>[0-9]+(?:\\.[0-9]+)*|devel|current)/",
        versionSelector: '.mb-2 a[href*="DOCSTUB"], .alert-warning a[href*="DOCSTUB"]',
        ruleId: 3,
        // Capture group: 1=path-after-version
        regexFilter: "^https://www\\.postgresql\\.org/docs/[^/]+(/.*)$",
        buildSubstitution: v => `https://www.postgresql.org/docs/${v}\\1`,
    },
    celery: {
        version: "stable",
        urls: "https://docs.celeryq.dev/*",
        pattern: "docs.celeryq.dev/en/(?<version>stable|master|latest|v?[0-9](?:\\.[0-9]+)*(?:-archived)?)/",
        // RTD Addons flyout lives in a shadow DOM; selector is relative to its shadow root
        versionSelector: 'dl.versions dd a',
        shadowHost: 'readthedocs-flyout',
        ruleId: 4,
        // Capture group: 1=path-after-version
        regexFilter: "^https://docs\\.celeryq\\.dev/en/[^/]+(/.*)$",
        buildSubstitution: v => `https://docs.celeryq.dev/en/${v}\\1`,
    },
    wagtail: {
        version: "stable",
        urls: "https://docs.wagtail.org/*",
        pattern: "docs.wagtail.org/en/(?<version>stable|master|latest|v?[0-9](?:\\.[0-9]+)*(?:-archived)?)/",
        // RTD Addons flyout lives in a shadow DOM; selector is relative to its shadow root
        versionSelector: 'dl.versions dd a',
        shadowHost: 'readthedocs-flyout',
        ruleId: 5,
        // Capture group: 1=path-after-version
        regexFilter: "^https://docs\\.wagtail\\.org/en/[^/]+(/.*)$",
        buildSubstitution: v => `https://docs.wagtail.org/en/${v}\\1`,
    },
};

let debug = false;
function debugMsg(msg) {
    if (debug) { console.debug(`%c ${msg}`, 'font-size: 15px; color: #090;'); }
}

async function loadPreferredVersions() {
    const stored = await browser.storage.sync.get('preferredVersions');
    const preferredVersions = stored.preferredVersions ?? {};
    let changed = false;
    for (const [platform, data] of Object.entries(docsData)) {
        if (!(platform in preferredVersions)) {
            preferredVersions[platform] = data.version;
            changed = true;
        }
    }
    if (changed) {
        await browser.storage.sync.set({ preferredVersions });
    }
    return preferredVersions;
}

async function rebuildRedirectRules(preferredVersions) {
    const removeRuleIds = Object.values(docsData).map(d => d.ruleId);
    const addRules = Object.entries(docsData).map(([platform, data]) => ({
        id: data.ruleId,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                regexSubstitution: data.buildSubstitution(
                    preferredVersions[platform] ?? data.version
                ),
            },
        },
        condition: {
            regexFilter: data.regexFilter,
            resourceTypes: ["main_frame"],
        },
    }));
    await browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
    debugMsg(`Rules updated: ${Object.keys(docsData).join(', ')}`);
}

async function initialize() {
    debugMsg("Initializing");
    const preferredVersions = await loadPreferredVersions();
    await rebuildRedirectRules(preferredVersions);
}

function identifyPlatform(url) {
    for (const [platform, data] of Object.entries(docsData)) {
        if (new RegExp(data.pattern).exec(url)) return platform;
    }
    return null;
}

async function setNewVersion(platform, version) {
    const stored = await browser.storage.sync.get('preferredVersions');
    const preferredVersions = stored.preferredVersions ?? {};
    if (platform === 'all') {
        for (const [p, data] of Object.entries(docsData)) {
            preferredVersions[p] = data.version;
        }
        debugMsg("Reset all to defaults");
    } else {
        preferredVersions[platform] = version;
        debugMsg(`Set ${platform} to ${version}`);
    }
    await browser.storage.sync.set({ preferredVersions });
    await rebuildRedirectRules(preferredVersions);
}

browser.runtime.onInstalled.addListener(initialize);
browser.runtime.onStartup.addListener(initialize);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.content) {
        case 'send-info': {
            const platform = identifyPlatform(sender.url);
            if (!platform) {
                sendResponse({ response: null });
                return;
            }
            browser.storage.sync.get('preferredVersions').then(stored => {
                const preferredVersions = stored.preferredVersions ?? {};
                sendResponse({ response: {
                    platform,
                    selector: docsData[platform].versionSelector,
                    shadowHost: docsData[platform].shadowHost ?? null,
                    preferredVersion: preferredVersions[platform] ?? docsData[platform].version,
                }});
            });
            return true; // keep channel open for async sendResponse
        }
        case 'set-version':
            setNewVersion(request.platform, request.newVersion);
            break;
        default:
            debugMsg(`Unknown message: ${request.content}`);
    }
});

console.log(`Unified Doc Switcher active for: ${Object.keys(docsData).join(', ')}`);
