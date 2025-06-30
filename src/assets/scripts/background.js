chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "contactAPI") {
        fetch(message.data.url, message.data.options)
            .then(async response => {
                let data;

                if (response.body && response.body.getReader) {
                    const blob = await response.blob();
                    const reader = new FileReader();

                    data = await new Promise((resolve) => {
                        reader.onloadend = function() {
                            resolve(reader.result);
                        };

                        reader.readAsDataURL(blob);
                    });
                } else {
                    const text = await response.text();
                    data = text;
                }

                if (message.data.excludeDataHeaders && data.startsWith('data:')) {
                    data = data.substring(data.indexOf(',') + 1);
                    data = data.replace(/\s/g, '');
                }

                sendResponse({ body: data, status: response.status, headers: Object.fromEntries(response.headers.entries()), url: message.data.url });
            })
            .catch(error => {
                console.error("Error contacting API:", error);
                sendResponse({ error: error.toString() });
            });

        return true;
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: "https://portal.openvle.xyz" });
});