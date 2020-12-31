let debug = true;
let debugMsg = function(msg) {
    if (debug) { console.log(msg); }
};
let versionSelector = '';
let versionPlatform;
let eventHandlerSet = false;

let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (!mutation.addedNodes || eventHandlerSet) return;
        if (document.querySelectorAll(versionSelector).length > 0) {
            setupEventHandler(versionSelector);
            observer.disconnect();
        }
    });
});


let setupEventHandler = function(selector) {
    document.querySelectorAll(selector).forEach(function(element) {
        let event;
        if (element.nodeName == 'SELECT') {
            event = 'change';
        } else {
            event = 'click';
        }
        element.addEventListener(event, function(e) {
            let newVersion;
            if (e.target.nodeName == 'SELECT') {
                newVersion = element.selectedOptions[0].innerText;
            } else {
                newVersion = element.innerText;
            }
            debugMsg(`Setting new preferred version for ${versionPlatform} to ${newVersion}`);
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

let versionSwitcherResponse = function(message) {
    versionSelector = message.response.selector;
    versionPlatform = message.response.platform;
    debugMsg(`Setting event handler for ${versionPlatform} on selector "${versionSelector}"`);

    if (document.querySelectorAll(versionSelector).length > 0) {
        debugMsg(`versionSwitcher found DOM element by selector, setting up handler.`);
        setupEventHandler(versionSelector);
    } else {
        debugMsg(`versionSwitcher didn't find DOM element by selector, setting up observer.`);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

const sending = browser.runtime.sendMessage({content: 'send-info'});
sending.then(versionSwitcherResponse);

// If we were redirected, show a banner
browser.storage.local.get('redirectedVersion').then(
    function(items) {
        if ('redirectedVersion' in items) {
            debugMsg(`content script: Redirected to version ${items.redirectedVersion}`);
            let version = items.redirectedVersion;
            browser.storage.local.remove('redirectedVersion');

            messageHTML = "<p>You&rsquo;ve been redirected to the " +
                "docs for <strong>" + version +
                "</strong>.&nbsp;&nbsp;- Unified Docs Switcher</p>";
            debugMsg(`going to display banner:\n${messageHTML}`);
            messageDiv = document.createElement('div');
            messageDiv.setAttribute('id', 'doc-switch-banner');
            messageDiv.innerHTML = messageHTML;
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
        }
    });
