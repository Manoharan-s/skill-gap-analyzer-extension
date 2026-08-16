require("dotenv").config(); // Load variables from .env file

const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from your Chrome Extension
app.use(cors());

// Convert incoming JSON into JavaScript objects
app.use(express.json());

// POST API to analyze a job description
app.post("/analyze", async (req, res) => {

    // Data sent by the extension
    const { jobDescription, userSkills } = req.body;

    try {

        // Send request to OpenRouter
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: "deepseek/deepseek-chat",

                    messages: [
                        {
                            role: "user",
                            content: `
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
}
User Skills:
${userSkills.join(", ")}

Job Description:
${jobDescription}
`
                        }
                    ]

                })

            }
        );

        // Check whether OpenRouter accepted the request
        if (!response.ok) {

            return res.status(response.status).json({
                error: "OpenRouter request failed"
            });

        }

        // Convert OpenRouter response into JavaScript object
        const data = await response.json();

        // Send AI response back to Chrome Extension
        res.json(data);//res.send(JSON.stringify(data)) equivalent to this line;

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong"
        });

    }

});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});