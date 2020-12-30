let debug = true;
let debugMsg = function(msg) {
    if (debug) { console.log(msg); }
};

let versionSwitcherResponse = function(message) {
    let info = message.response;
    debugMsg(`Setting event handler for ${info.platform} on selector "${info.selector}"`);

    document.querySelectorAll(info.selector).forEach(function(element) {
        element.addEventListener('click', function() {
            let newVersion = element.innerHTML;
            debugMsg(`Setting new preferred version for ${info.platform} to ${newVersion}`);
            browser.runtime.sendMessage({
                content: 'set-version',
                platform: info.platform,
                newVersion: newVersion
            });
            return true;
        });
    });        
    
};

function handleError(error) {
    debugMsg(`Error: ${error}`);
};


const sending = browser.runtime.sendMessage({content: 'send-info'});
sending.then(versionSwitcherResponse, handleError);

// If we were redirected, show a banner
browser.storage.local.get('redirectedVersion').then(
    function(items) {
        if ('redirectedVersion' in items) {
            debugMsg(`content script: Redirected to version ${items.redirectedVersion}`);
            let version = items.redirectedVersion;
            browser.storage.local.remove('redirectedVersion');

            messageHTML = "<div id='doc-switch-banner'><p>You&rsquo;ve been redirected to the " +
                "docs for <strong>" + version +
                "</strong>.&nbsp;&nbsp;- Unified Docs Switcher</p></div>";
            debugMsg(`going to display banner:\n${messageHTML}`);
            messageDiv = document.createElement('div');
            messageDiv.innerHTML = messageHTML;
            document.body.appendChild(messageDiv);

            let hideMsg = function(opacity) {
                messageDiv.style.opacity = opacity;
                opacity = opacity - 0.1;
                if (opacity > 0) {
                    return window.setTimeout(hideMsg, 100, opacity);
                }
            };

            window.setTimeout(hideMsg, 5000, 0.7);
        }
    });
 

