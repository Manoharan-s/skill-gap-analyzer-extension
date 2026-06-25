
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

            Rules:
            - Return ONLY a JSON array.
            - Remove duplicates.
            - Preserve the original skill names.
            - Do not explain.
            - Do not greet.
            - Do not use markdown.
            - Give everything in Lowercase
            - Do NOT infer skills.
            - Do NOT generate related skills.
            - Do NOT expand abbreviations.
            - Do NOT create new combinations.
            - Do NOT guess competencies.
            - If a skill is not explicitly present in the input, do not include it.
            -Return only the skills exactly as they appear.
            Exclude:
            - Languages spoken (Tamil, Telugu, Hindi, English, etc.)
            - Educational streams (Arts, Science, Commerce, etc.)
            - Degrees and college names
            - Company names
            - Person names
            - Locations
            - Sports and hobbies (Kho Kho, Cricket, Football, Chess, etc.)
            - Interests
            - Generic profile headings
            Extract ONLY skills that are explicitly mentioned.:

            Do NOT infer or generate related skills.

            Do NOT include:
            - Interests
            - Hobbies
            - Volunteer activities
            - Clubs
            - Society memberships
            - Languages spoken
            - Educational streams
            - Company names
            - Locations
            - Person names
            - Awards
            - Project names (unless they are widely recognized technologies)

            Remove duplicate skills.

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

                document.getElementById("result").innerText =
                    response.text;
                await testAI(response.text);
                
            }
        );
        

       
    });
    

}
);

