// document.getElementById("analyzeBtn").addEventListener("click", async () => {
//     const [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     });

//     chrome.tabs.sendMessage(
//         tab.id,
//         { action: "getPageText" },
//         (response) => {

//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError);
//                 document.getElementById("result").innerText =
//                     chrome.runtime.lastError.message;
//                 return;
//             }

//             document.getElementById("result").innerText =
//                 response.text.substring(0, 500);
//         }
//     );
// });