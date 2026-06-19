// console.log("Content script loaded!");
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "getPageText") {
//         sendResponse({
//             text: document.body.innerText
//         });
//     }
// });
function GetTextFromProfile(){
    return document.body.innerText

}
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
    if (request.action==="gettext"){
        sendResponse({
            text:GetTextFromProfile()
        })
    }
}
)