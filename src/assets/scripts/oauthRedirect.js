chrome.storage.local.get("oauthRedirect", (result) => {
    if (result.oauthRedirect) {
        chrome.storage.local.remove("oauthRedirect", () => {
            window.location.replace("https://portal.openvle.xyz");
        });
    }
});
