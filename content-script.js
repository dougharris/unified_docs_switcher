(function () {
    const browser = globalThis.browser ?? globalThis.chrome;

    let debug = false;
    let debugMsg = function(msg) {
        if (debug) { console.debug(msg); }
    };
    let versionSelector = '';
    let versionPlatform;
    let shadowHostSelector = null;
    let eventHandlerSet = false;

    // Returns the shadow root for RTD-style platforms, or document for everything else.
    let getQueryRoot = function() {
        if (shadowHostSelector) {
            const host = document.querySelector(shadowHostSelector);
            return host && host.shadowRoot ? host.shadowRoot : null;
        }
        return document;
    };

    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes || eventHandlerSet) return;
            const root = getQueryRoot();
            if (root && root.querySelectorAll(versionSelector).length > 0) {
                setupEventHandler();
                observer.disconnect();
            }
        });
    });

    let setupEventHandler = function() {
        const root = getQueryRoot();
        if (!root) return;
        root.querySelectorAll(versionSelector).forEach(function(element) {
            let event;
            if (element.nodeName == 'SELECT') {
                event = 'change';
            } else {
                event = 'click';
            }
            element.addEventListener(event, function(e) {
                let newVersion;
                if (e.target.nodeName == 'SELECT') {
                    newVersion = element.selectedOptions[0].value;
                } else {
                    newVersion = element.innerText;
                }
                newVersion = newVersion.toLowerCase();
                console.log(`Unified Doc Switcher: Setting new preferred version ` +
                            `for ${versionPlatform} to ${newVersion}`);
                browser.runtime.sendMessage({
                    content: 'set-version',
                    platform: versionPlatform,
                    newVersion: newVersion
                });
                return true;
            });
        });
        eventHandlerSet = true;
    };

    let showRedirectBanner = function(version) {
        console.log(`Unified Doc Switcher: Redirected to version ${version}`);
        let messageHTML = "<p>You&rsquo;ve been redirected to the " +
            "docs for <strong>" + version +
            "</strong>.&nbsp;&nbsp;- Unified Docs Switcher</p>";
        let parsed = new DOMParser().parseFromString(messageHTML, 'text/html');
        let messageP = parsed.querySelector('p');

        let messageDiv = document.createElement('div');
        messageDiv.setAttribute('id', 'doc-switch-banner');
        messageDiv.appendChild(messageP);
        messageDiv.addEventListener('click', () => { hideMsg(0); });
        document.body.appendChild(messageDiv);

        let hideMsg = function(opacity) {
            messageDiv.style.opacity = opacity;
            opacity = opacity - 0.1;
            if (opacity > 0) {
                return window.setTimeout(hideMsg, 100, opacity);
            } else {
                document.body.removeChild(messageDiv);
            }
        };

        window.setTimeout(hideMsg, 5000, 0.7);
    };

    let versionSwitcherResponse = function(message) {
        if (!message.response) return;

        versionSelector = message.response.selector;
        versionPlatform = message.response.platform;
        shadowHostSelector = message.response.shadowHost;
        let preferredVersion = message.response.preferredVersion;

        if (versionSelector.indexOf('DOCSTUB') > 0) {
            let path = window.location.pathname;
            let stub = path.substring(path.lastIndexOf('/'));
            versionSelector = versionSelector.replaceAll('DOCSTUB', stub);
        }

        debugMsg(`Setting event handler for ${versionPlatform} on selector "${versionSelector}"`);

        const root = getQueryRoot();
        if (root && root.querySelectorAll(versionSelector).length > 0) {
            debugMsg(`versionSwitcher found DOM element by selector, setting up handler.`);
            setupEventHandler();
        } else {
            debugMsg(`versionSwitcher didn't find DOM element by selector, setting up observer.`);
            // For shadow DOM platforms, observe the shadow root if available; otherwise
            // observe document.body and let the observer call getQueryRoot() once it appears.
            const observeTarget = (shadowHostSelector &&
                document.querySelector(shadowHostSelector)?.shadowRoot) || document.body;
            observer.observe(observeTarget, {
                childList: true,
                subtree: true
            });
        }

        // Show banner if we were redirected to the preferred version
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry && navEntry.redirectCount > 0 && preferredVersion) {
            showRedirectBanner(preferredVersion);
        }
    };

    const sending = browser.runtime.sendMessage({content: 'send-info'});
    sending.then(versionSwitcherResponse);
})();
