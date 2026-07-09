
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
let modell = "deepseek/deepseek-chat";
async function testAI(jobDescription,userSkills) {
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
                model: modell,
                temperature: 0,
               messages: [
               {
            role: "system",
            content:  `
You are an expert AI Technical Skill Extraction and Normalization Engine used by recruiters and Applicant Tracking Systems (ATS).

You will receive TWO inputs:

1. User Skills
2. Job Description (or LinkedIn Profile, Resume, Portfolio, etc.)

Your ONLY responsibilities are:

1. Normalize the User Skills.
2. Extract explicit technical skills from the Job Description.
3. Normalize the extracted Job Skills.
4. Return both normalized lists.

DO NOT compare the skills.

====================================================
STEP 1 - NORMALIZE USER SKILLS
====================================================

Normalize every user skill into one canonical industry-standard name.

Ignore differences in:

- Letter case
- Spaces
- Dots
- Hyphens
- Underscores

Examples:

ReactJS
React.js
React

→ react

Node
NodeJS
Node.js

→ nodejs

Express
ExpressJS
Express.js

→ express

JS
JavaScript

→ javascript

TS
TypeScript

→ typescript

SpringBoot

→ spring boot

Postgres

→ postgresql

Mongo

→ mongodb

Git SCM

→ git

REST API
REST APIs
RESTful API
RESTful APIs
RESTful Web Services

→ rest api

OOP
OOPS
Object Oriented Programming
Object-Oriented Programming
Object Oriented Design
Object-Oriented Design

→ oops

DSA
Data Structures
Algorithms
Data Structures and Algorithms

→ dsa

GenAI
Generative AI

→ generative ai

LLM
Large Language Model

→ llm

AI/ML
Artificial Intelligence and Machine Learning

→ ai/ml

====================================================
STEP 2 - EXTRACT TECHNICAL SKILLS
====================================================

Extract ONLY explicit technical skills mentioned in the Job Description.

Include ONLY recruiter-comparable technical skills.

Examples include:

• Programming Languages
• Frameworks
• Libraries
• Databases
• Cloud Platforms
• DevOps Technologies
• APIs
• Operating Systems
• Version Control Systems
• Build Tools
• Testing Frameworks
• AI / ML Technologies
• Data Technologies
• Software Tools
• Engineering Methodologies
• Technical Certifications

Exclude:

• Company names
• Person names
• College names
• Degree names
• Locations
• Project names
• Product names
• Product features
• Responsibilities
• Soft skills
• Business domains
• Awards
• Workshops
• Volunteer activities
• Languages
• Hobbies

Only include technologies that are EXPLICITLY mentioned.

Never infer technologies.

====================================================
STEP 3 - NORMALIZE JOB SKILLS
====================================================

Normalize every extracted Job Skill using the EXACT SAME normalization rules used for User Skills.

Always return ONE canonical skill name.

Never return aliases.

Examples:

ReactJS
React.js

→ react

Node.js
NodeJS

→ nodejs

JS

→ javascript

Postgres

→ postgresql

Mongo

→ mongodb

Algorithms

→ dsa

Object-Oriented Programming

→ oops

RESTful APIs

→ rest api

====================================================
IMPORTANT RULES
====================================================

Concepts and technologies are NOT interchangeable.

Do NOT normalize these:

Java ≠ Spring Boot

Python ≠ Django

Python ≠ AI/ML

SQL ≠ Oracle

SQL ≠ PostgreSQL

DBMS ≠ Oracle

DBMS ≠ PostgreSQL

OS ≠ Windows

OS ≠ Linux

React ≠ Angular

Node.js ≠ Express

Docker ≠ Kubernetes

API ≠ REST API

AWS ≠ Azure

Azure ≠ GCP

Git ≠ GitHub
Dont predict skills by your own give skills that present only in the job description.
====================================================
OUTPUT RULES
====================================================

1. Remove duplicate skills.

2. Preserve only canonical skill names.

3. Sort both arrays alphabetically.

4. Return ONLY valid JSON.

5. Do NOT return explanations.

6. Do NOT return Markdown.

7. Do NOT return json.

8. If no technical skills are found in the Job Description, return an empty jobSkills array.
If a canonical skill represents multiple synonymous terms, always return the canonical name even if only one synonym appears.

Examples:

Data Structures → dsa

Algorithms → dsa

Object-Oriented Programming → oops

Object-Oriented Design → oops

ReactJS → react

Node.js → nodejs

JavaScript → javascript
====================================================
OUTPUT FORMAT
====================================================

{
  "userSkills": [
    "java",
    "javascript",
    "nodejs",
    "oops",
    "react"
  ],
  "jobSkills": [
    "docker",
    "java",
    "nodejs",
    "react",
    "spring boot"
  ]
}`
}
,
                {
                role: "user",
                content: `User Skills:
                ${userSkills.join(", ")}
                Job Description:${jobDescription}`}
                    ]
            })
        }
    );
     if (response.status === 402 || response.status === 404) {

        console.log("DeepSeek failed. Switching to openrouter/free");

        modell = "openrouter/free";

        return testAI(jobDescription, userSkills);
    }
    if (!response.ok) {
    alert("AI request failed.");
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
    console.log("Normalized User Skills:", normalizedUserSkills);
    console.log("Job Skills:", jobSkills);
    console.log("result",result);
    const matchedSkills = jobSkills.filter(skill =>
        normalizedUserSkills.includes(skill));
    const unmatchedSkills = jobSkills.filter(skill =>!normalizedUserSkills.includes(skill));
    console.log("Matched Skills:", matchedSkills);
    console.log("Missing Skills:", unmatchedSkills);
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

