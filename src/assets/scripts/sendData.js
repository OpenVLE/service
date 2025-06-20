window.addEventListener("message", async (event) => {
    if (event.data.type === "hello-world") {
        window.postMessage({ type: "heartbeat", data: { verNum: `${chrome.runtime.getManifest().version}` } }, "*");
    } else if (event.data.type === "contactAPI") {
        const apiResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {
                    type: "contactAPI",
                    data: event.data.data
                }, (response) => {
                    resolve(response);
                }
            );
        });

        window.postMessage({ type: "apiResponse", data: apiResponse }, "*");
    }
});

// -- request example

// window.postMessage({
//     type: "contactAPI",
//     data: {
//         url: "https://bromcomvle.com/AccountSettings/GetPersonPhoto",
//         options: {
//             headers: {
//                 "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
//                 "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//                 "cache-control": "no-cache",
//                 "pragma": "no-cache",
//                 "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
//                 "sec-ch-ua-mobile": "?0",
//                 "sec-ch-ua-platform": "\"macOS\"",
//                 "sec-fetch-dest": "image",
//                 "sec-fetch-mode": "no-cors",
//                 "sec-fetch-site": "same-origin"
//             },
//             referrer: "https://bromcomvle.com/Home/Dashboard",
//             referrerPolicy: "strict-origin-when-cross-origin",
//             method: "GET",
//             mode: "cors",
//             credentials: "include"
//         }
//     }
// }, "*");