
chrome.storage.local.get("userSkills", (data) => {

    if (data.userSkills) {

        document.getElementById("skills").value =
            data.userSkills.join(", ");

    }

});
document.getElementById("saveBtn").addEventListener("click", () => {

    const rawSkills =
        document.getElementById("skills").value;

    if (!rawSkills.trim()) {
        alert("Please enter skills");
        return;
    }

    const skills = rawSkills
    .split(/[,\s]+/)
    .filter(skill => skill.trim() !== "");

    chrome.storage.local.set({
        userSkills: skills
    });

    alert("Skills Saved Successfully");
});
document.getElementById("analysebtn").addEventListener("click", async () => {

    chrome.storage.local.get("userSkills", async (data) => {

        const userSkills = data.userSkills;

        if (!userSkills || userSkills.length === 0) {
            alert("Please save your skills first");
            return;
        }

        console.log("Stored Skills:", userSkills);

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(
            tab.id,
            { action: "gettext" },
            (response) => {

                console.log("Response:", response);

                if (!response) {
                    console.log("Response is undefined");
                    return;
                }

                document.getElementById("result").innerText =
                    response.text;
            }
        );

    });

});

