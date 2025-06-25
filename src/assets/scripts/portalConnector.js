const manifest = chrome.runtime.getManifest();

window.addEventListener("message", async (event) => {
    const trustedOrigins = manifest.trusted_origins || [];
    const portalOrigin = manifest.portal_origin;

    const isAllowedOrigin = trustedOrigins.includes(event.origin);

    if (!isAllowedOrigin) return;
    if (!portalOrigin) return console.error("No portal origin was specified in the manifest, refusing to respond to calls lmao");

    if (event.data.type === "hello-world") {
        window.postMessage({ type: "heartbeat", data: { verNum: `${chrome.runtime.getManifest().version}` } }, portalOrigin);
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