const manifest = chrome.runtime.getManifest();

window.addEventListener("message", async (event) => {
    const openVLEConfig = manifest.openVLEConfig || {};
    const trustedOrigins = openVLEConfig.trusted_origins || [];

    const isAllowedOrigin = trustedOrigins.includes(event.origin);
    if (!isAllowedOrigin) return;

    if (event.data.type === "hello-world") {
        window.postMessage({ type: "heartbeat", data: { verNum: `${manifest.version}` } }, event.origin);
    } else if (event.data.type === "contactAPI") {
        const apiResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {
                    type: event.data.type,
                    data: event.data.data
                }, (response) => resolve(response)
            );
        });

        window.postMessage({ type: "apiResponse", data: apiResponse }, event.origin);
    } else if (event.data.type === "setOAuthRedirect") {
        chrome.storage.local.set({ oauthRedirect: true });
        window.postMessage({ type: "setOAuthCallback", data: true }, event.origin);
    }
});