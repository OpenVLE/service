const manifest = chrome.runtime.getManifest();

window.addEventListener("message", async (event) => {
    const openVLEConfig = manifest.openVLEConfig || {};
    const trustedOrigins = openVLEConfig.trusted_origins || [];
    const portalOrigin = openVLEConfig.portal_origin;

    const isAllowedOrigin = trustedOrigins.includes(event.origin);

    if (!isAllowedOrigin) return;
    if (!portalOrigin) return console.error("No portal origin was specified in the manifest, refusing to respond to calls lmao");

    if (event.data.type === "hello-world") {
        window.postMessage({ type: "heartbeat", data: { verNum: `${manifest.version}` } }, portalOrigin);
    } else if (event.data.type === "contactAPI") {
        const apiResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {
                    type: "contactAPI",
                    data: event.data.data
                }, (response) => resolve(response)
            );
        });

        window.postMessage({ type: "apiResponse", data: apiResponse }, portalOrigin);
    }
});