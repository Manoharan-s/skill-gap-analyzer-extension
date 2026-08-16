
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
async function testAI(jobDescription,userSkills) {
    const response = await fetch("http://localhost:3000/analyze", {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
    jobDescription: jobDescription,
    userSkills: userSkills
})

});

if (!response.ok) {

    alert("Backend request failed.");

    return;

}

const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    aiResponse = aiResponse
        .replace("```json", "")
        .replace("```", "")
        .trim();
    console.log(aiResponse);
    let result;
    try {
    result = JSON.parse(aiResponse);
    } catch (error) {
    alert("Failed to parse AI response.");
    console.error(error);
    return;
}

    const normalizedUserSkills = result.userSkills;
    const jobSkills = result.jobSkills;
    // console.log("Normalized User Skills:", normalizedUserSkills);
    // console.log("Job Skills:", jobSkills);
    // console.log("result",result);
    const matchedSkills = jobSkills.filter(skill =>
        normalizedUserSkills.includes(skill));
    const unmatchedSkills = jobSkills.filter(skill =>!normalizedUserSkills.includes(skill));
    // console.log("Matched Skills:", matchedSkills);
    // console.log("Missing Skills:", unmatchedSkills);
    const totalSkills = matchedSkills.length + unmatchedSkills.length;
    const matchScore =
    totalSkills === 0
    ? 0
    : Math.round((matchedSkills.length / totalSkills) * 100);
    console.log("Match Score:", matchScore);
    let matchedHTML = "";
    matchedSkills.forEach(skill => 
        {
            const formattedSkill =skill.charAt(0).toUpperCase() + skill.slice(1);
            matchedHTML += `<li>${formattedSkill}</li>`;
});
    console.log("matched html",matchedHTML)
    document.getElementById("matchedSkills").innerHTML =matchedHTML;
    let missingHTML = "";
    unmatchedSkills.forEach(skill => {
        const formattedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
        missingHTML += `<li>${formattedSkill}</li>`;
    });
    if (matchedSkills.length === 0 && unmatchedSkills.length === 0) {

    document.getElementById("result").innerHTML =
        "<p>No technical skills were found in this profile.</p>";

    document.getElementById("result").style.display = "block";

    return;
}
    console.log("unmatched html",missingHTML)
    document.getElementById("unmatchedSkills").innerHTML =missingHTML;
    document.getElementById("matchedTitle").innerText =`Matched Skills (${matchedSkills.length})`;
    document.getElementById("missingTitle").innerText =`Missing Skills (${unmatchedSkills.length})`;
    document.getElementById("result").style.display = "block";
    document.getElementById("score-container").style.display = "flex";
    const circlee = document.querySelector(".circle");
    circlee.style.background =
    `conic-gradient(
         #DFD0B8 ${matchScore}%,
        #FFFFFF ${matchScore}%
    )`;
    document.getElementById("score").innerText = `${matchScore}%`;
    // document.querySelector(".circle").style.display = "flex";
    
    document.getElementById("analysebtn").disabled = false;
    document.getElementById("aiIcon").src ="icons/ChatGPT Image Jun 26, 2026, 06_46_11 PM.png";
    document.getElementById("analyseText").innerText ="Analyze";
    console.log(data.choices[0].message.content);
    // document.getElementById("result").innerText =
    //                 data.choices[0].message.content;
}
document.getElementById("analysebtn").addEventListener("click", async () => {
    // document.getElementById("result").innerText = "";

    chrome.storage.local.get("userSkills", async (data) => {
        //  testAI();

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
        const analyseBtn = document.getElementById("analysebtn");
        const aiIcon = document.getElementById("aiIcon");
        const analyseText = document.getElementById("analyseText");

        analyseBtn.disabled = true;

        aiIcon.src = "icons/icon.gif";

        analyseText.innerText = "Analyzing...";

        chrome.tabs.sendMessage(
            tab.id,
            { action: "gettext" },
            async(response) => {

                console.log("Response:", response);

                if (!response) {
                    console.log("Response is undefined");
                    return;
                }
                await testAI(response.text,userSkills);
                
            }
        );
        

       
    });
    

}
);
document.getElementById("closeBtn").addEventListener("click", () => {
    window.close();
});

