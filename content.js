// console.log("Content script loaded!");
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "getPageText") {
//         sendResponse({
//             text: document.body.innerText
//         });
//     }
// });
// console.log("CONTENT SCRIPT LOADED");
// function GetTextFromProfile(){
//     return document.body.innerText

// }
// chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
//     if (request.action==="gettext"){
//         sendResponse({
//             text:GetTextFromProfile()
//         })
//     }
// })
alert("CONTENT SCRIPT INJECTED");
function GetTextFromProfile() {
    return document.body.innerText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message in content script:", request);
    if (request.action === "gettext") {
        sendResponse({
            text: GetTextFromProfile()
        });
    }
});
