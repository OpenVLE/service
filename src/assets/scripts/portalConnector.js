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
    } else if (event.data.type === "obtainSSOURL") {
        const apiResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {
                    type: "contactAPI",
                    data: {
                        url: "https://bromcomvle.com/auth/login",
                        excludeDataHeaders: true,
                        options: {
                            headers: {
                                "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
                                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                                "cache-control": "no-cache",
                                "pragma": "no-cache",
                                "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"macOS\"",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "none",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1"
                            },
                            referrerPolicy: "strict-origin-when-cross-origin",
                            body: null,
                            method: "GET",
                            mode: "cors",
                            credentials: "include"
                        }
                    }
                }, (response) => resolve(response)
            );
        });

        if (apiResponse) {
            const parser = new DOMParser();
            const provider = event.data.data.provider;
            const decodedHTML = atob(apiResponse.body);
            const doc = parser.parseFromString(decodedHTML, 'text/html');
            let ssoURL = "";

            if (provider === "google") {
                ssoURL = doc.getElementById("btnLinkGoogleAccount").getAttribute("href");
            } else if (provider === "microsoft") {
                ssoURL = doc.getElementById("btnLinkMicrosoftAccount").getAttribute("href");
            }

            chrome.storage.local.set({ oauthRedirect: true });
            window.postMessage({ type: "obtainSSOLinkCallback", data: ssoURL }, event.origin);
        }
    }
});