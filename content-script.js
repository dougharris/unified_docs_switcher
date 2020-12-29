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
 
