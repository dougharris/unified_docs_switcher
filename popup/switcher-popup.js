(() => {
    let storage = browser.storage.sync;

    let init = () => {
        document.getElementById('reset-action').addEventListener('click', resetPlatform);
        showPreferredVersions();
    };

    let showPreferredVersions = async () => {
        let results = await storage.get('preferredVersions');
        let preferredVersions = results.preferredVersions;
        let versionsDiv = document.createElement('div');
        let versionHTML = "<table id=version-text>";
        for (let item in preferredVersions) {
            versionHTML = versionHTML + `<tr><td class="left">${item}:</td>` +
                `<td class="right">${preferredVersions[item]}</td></tr>`;
        };
        versionHTML = versionHTML + "</table>";
        let parsed = new DOMParser().parseFromString(versionHTML, 'text/html');
        let textDiv = parsed.querySelector('table#version-text');
        let versionsNode = document.getElementById('current-versions');
        if (versionsNode.hasChildNodes()) {
            versionsNode.replaceChild(textDiv, versionsNode.firstChild);
        } else {
            versionsNode.appendChild(textDiv);
        }
    };

    let resetPlatform = () => {
        let messagePromise = browser.runtime.sendMessage({
            content: 'set-version',
            platform: 'all',
            newVersion: 'all'
        });
        messagePromise.then(() => {
            fadeVersions(1);
            showPreferredVersions();
            showVersions(0);
        });
    };

    let fadeVersions = (opacity) => {
        let versionsNode = document.querySelector('.doc-switcher-popup div');
        versionsNode.style.opacity = opacity;
        opacity = opacity - 0.1;
        if (opacity > 0) {
            return window.setTimeout(fadeVersions, 100, opacity);
        }
    };

    let showVersions = (opacity) => {
        let versionsNode = document.querySelector('.doc-switcher-popup div');
        versionsNode.style.opacity = opacity;
        opacity = opacity + 0.1;
        if (opacity < 1) {
            return window.setTimeout(showVersions, 100, opacity);
        }
    };

    init();
    
})();
