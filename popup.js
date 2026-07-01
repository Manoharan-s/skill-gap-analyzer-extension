
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
async function testAI(jobDescription) {
    console.log("Testing AI with API Key:",CONFIG.API_KEY);

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CONFIG.API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-chat",
               messages: [
               {
            role: "system",
            content: `
            You are an AI skill extraction engine.

Analyze the provided professional text (LinkedIn profile, resume, job description, portfolio, or similar).

Extract ONLY explicit recruiter-comparable skills.

Include ONLY:
- Programming languages
- Frameworks
- Libraries
- Databases
- Developer tools
- Software
- Platforms
- Cloud technologies
- DevOps technologies
- APIs
- Operating systems
- Technical methodologies
- Engineering concepts
- AI/ML technologies
- Testing frameworks
- Build tools
- Version control systems
- Technical certifications

Exclude:
- Project names
- Company names
- Person names
- College names
- Degrees
- Locations
- Languages spoken
- Hobbies
- Interests
- Volunteer activities
- Clubs and societies
- Awards
- Workshops
- Training programs
- Event management
- Event organizing
- Generic profile headings
- Soft skills
- Business responsibilities
- Job responsibilities
- Features implemented
- Product capabilities
- Functional requirements
- User stories
- Business domains
- Team activities

Strict Rules:
- Do NOT infer skills.
- Do NOT generate related skills.
- Do NOT expand abbreviations.
- Do NOT create new combinations.
- Do NOT include project names.
- Do NOT include feature names.
- Do NOT include responsibilities.
- Do NOT include workflow descriptions.
- Only include technologies or established professional skills explicitly mentioned.
- Preserve the original wording.
- Convert every skill to lowercase.
- Remove duplicates.
- Return ONLY a valid JSON array.
            `
},
                {
                        role: "user",
                        content: jobDescription
                }
                    ]
            })
        }
    );

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    aiResponse = aiResponse
        .replace("```json", "")
        .replace("```", "")
        .trim();
    console.log(aiResponse);

    const aiSkills = JSON.parse(aiResponse);
    console.log("AI Skills:", aiSkills);
    if (aiSkills.length === 0) {

    document.getElementById("result").innerHTML =
        "<p>No technical skills were found in this profile.</p>";

    document.getElementById("result").style.display = "block";

    return;
}
    chrome.storage.local.get("userSkills", (data) => {

        console.log("Saved Skills:", data.userSkills);
    

    console.log(data);
    const savedSkills = data.userSkills.map(skill =>
        skill.toLowerCase().replace(/[.\-\s]/g, "").trim()
    );

    const jobSkills = aiSkills.map(skill =>
        skill.toLowerCase().replace(/[.\-\s]/g, "").trim()
    );
    console.log("Normalized Saved:", savedSkills);
    console.log("Normalized Job:", jobSkills);
    const matchedSkills = jobSkills.filter(skill =>
    savedSkills.includes(skill)
);
    const unmatchedSkills = jobSkills.filter(skill =>
    !savedSkills.includes(skill)
);
    console.log("Matched:", matchedSkills);
    console.log("Unmatched:", unmatchedSkills);
    document.getElementById("matchedSkills").innerHTML =
    matchedSkills.join("<br>");

    document.getElementById("unmatchedSkills").innerHTML =
    unmatchedSkills.join("<br>");
    document.getElementById("result").style.display = "block";

});
    
    

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

        chrome.tabs.sendMessage(
            tab.id,
            { action: "gettext" },
            async(response) => {

                console.log("Response:", response);

                if (!response) {
                    console.log("Response is undefined");
                    return;
                }
                await testAI(response.text);
                
            }
        );
        

       
    });
    

}
);
document.getElementById("closeBtn").addEventListener("click", () => {
    window.close();
});

