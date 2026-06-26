
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

            Analyze the given professional text. The text may be from:
            - A LinkedIn profile
            - A Resume
            - A Job Description
            - A Portfolio
            - Any professional document

            Extract every professional skill that is explicitly mentioned, including but not limited to:

            - Technical skills
            - Domain-specific skills
            - Engineering skills
            - Programming languages
            - Frameworks
            - Libraries
            - Tools
            - Software
            - Platforms
            - Databases
            - Cloud technologies
            - DevOps technologies
            - APIs
            - Methodologies
            - Technical concepts
            - Core subject knowledge
            - Industry-specific knowledge
            - Business skills
            - Analytical skills
            - Leadership skills
            - Communication skills
            - Project management skills
            - Certifications
            - Professional competencies

            Include:

                    Programming languages
                    Frameworks
                    Libraries
                    Tools
                    Software
                    Platforms
                    Databases
                    Cloud technologies
                    DevOps technologies
                    APIs
                    Technical concepts
                    Engineering skills
                    Domain-specific skills
                    Methodologies
                    Business skills
                    Analytical skills
                    Project management skills
                    Professional competencies
                    Industry-specific knowledge
                    Technical certifications

            Exclude:

                    Languages spoken
                    Degrees, educational streams, college names, and universities
                    Company names
                    Person names
                    Locations
                    Sports and hobbies
                    Interests
                    Volunteer activities
                    Clubs and societies
                    Extracurricular activities
                    Event management
                    Event organizing
                    Training programs
                    Workshops
                    Awards
                    Project names (unless they are widely recognized technologies)
                    Generic profile headings
                    Soft skills
                    Certifications that are not technical
            Remove duplicate skills.
            Return:

            A JSON array only.
            All skills in lowercase.
            Remove duplicates.
            Preserve the exact skill names as written.
            Do not infer, guess, expand abbreviations, generate related skills, or create new combinations.

            Return only skills that a recruiter would compare against a job requirement.
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

    console.log(data);
    

    console.log(data.choices[0].message.content);
    document.getElementById("result").innerText =
                    data.choices[0].message.content;
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

