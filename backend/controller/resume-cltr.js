import fs from "fs/promises";
import Resume from "../models/resumeSchema.js";
import aiService from "../services/aiServices.js";
import ResumeAnalysis from "../models/resumeAnalysisSchema.js";


export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({success: false,error: "Please upload a PDF"});
    }

    // Check if this user already has a resume
    const existingResume = await Resume.findOne({userId: req.userId});
   
    if (existingResume) {
      // Delete the newly uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn("Could not delete newly uploaded resume:",err.message);
      }

      return res.status(409).json({
        success: false,
        error: "You have already uploaded a resume"
      });
    }

    // Create new resume
    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: resume
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);

    // If something fails after Multer saved the file,
    // try to remove that file
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn(
          "Could not delete uploaded file:",
          err.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};


export const generateResumeAnalysis = async (req, res) => {
  try {
    const userId = req.userId;
    const resumeText = req.resumeText;
    const preferredJobRole = req.preferredJobRole;
    const prompt = `
        You are an expert ATS resume analyzer and career advisor.

        Your task is to analyze the candidate's resume specifically for the candidate's preferred job role.

        PREFERRED JOB ROLE:
        ${preferredJobRole}

        RESUME:
        ${resumeText}

        IMPORTANT:
        Do NOT provide a generic resume score.

        The ATS score must represent how suitable this resume is for the specific preferred job role:
        "${preferredJobRole}"

        Evaluate the resume based on:

        1. Technical skills relevant to the preferred job role
        2. Required skills that the candidate already possesses
        3. Relevant projects
        4. Work experience
        5. Education
        6. ATS keywords
        7. Missing skills and technologies relevant to the preferred job role
        8. Value-adding skills and technologies already present in the resume
        9. Role relevance
        10. Resume structure
        11. Overall suitability for the preferred job role


        RETURN EXACTLY THIS JSON STRUCTURE:

        {
          "roleAnalysis": {
            "role": "${preferredJobRole}",
            "atsScore": 0,
            "strengths": [],
            "weaknesses": [],
            "suggestions": [],
            "missingSkills": [],
            "valueAddingSkills": []
          }
        }


        STRICT RULES:


        1. ROLE

        - The "role" field must contain exactly:
          "${preferredJobRole}"

        - Do not modify, shorten, or rename the role.


        2. ATS SCORE

        - "atsScore" must be a number between 0 and 100.
        - The score must represent how well the resume matches the preferred job role.
        - Consider technical skills, ATS keywords, projects, experience, education, and overall role relevance.


        3. STRENGTHS

        - "strengths" must be an array of strings.
        - Identify the strongest aspects of the resume for the preferred job role.
        - Strengths may contain short explanations.
        - minimum 4 points is mandatory.


        4. WEAKNESSES

        - "weaknesses" must be an array of strings.
        - Identify weaknesses or limitations of the resume for the preferred job role.
        - Weaknesses may contain short explanations.
        - minimum 4 points is mandatory. 


        5. SUGGESTIONS

        - "suggestions" must be an array of strings.
        - Provide actionable recommendations for improving the resume for the preferred job role.
        - Suggestions may contain short explanations.
        - minimum 4 points is mandatory. 


        6. MISSING SKILLS

        - "missingSkills" must contain ONLY keywords.
        - Each item must be a skill, technology, tool, framework, library, platform, certification, or ATS keyword.
        - Each item must be short, preferably 1-3 words.
        - Do NOT write sentences.
        - Do NOT provide explanations.
        - Do NOT provide reasons.
        - Do NOT provide recommendations.
        - Do NOT include phrases such as "The candidate should learn..."
        - Only include skills that are relevant or commonly required for "${preferredJobRole}" AND are absent from the resume.
        - Do not include a skill if it is already clearly present in the resume.
        - Do not duplicate skills.

        Example:

        ["TypeScript", "Docker", "AWS", "Jest"]


        7. VALUE-ADDING SKILLS

        - "valueAddingSkills" must contain ONLY keywords.
        - Each item must be a skill, technology, tool, framework, library, platform, certification, or ATS keyword.
        - Each item must be short, preferably 1-3 words.
        - Do NOT write sentences.
        - Do NOT provide explanations.
        - Do NOT provide reasons.
        - Do NOT provide recommendations.
        - Only include skills that are clearly present in the resume AND provide a competitive advantage for "${preferredJobRole}".
        - Do not include skills that are absent from the resume.
        - Do not duplicate skills.

        Example:

        ["React", "Node.js", "MongoDB", "Express.js"]


        8. IMPORTANT DISTINCTION

        - missingSkills = relevant skills required for the preferred job role but ABSENT from the resume.

        - valueAddingSkills = relevant skills already PRESENT in the resume that provide a competitive advantage.

        - Never put the same skill in both arrays.

        - Never invent skills that are not present in the resume for valueAddingSkills.


        9. OUTPUT FORMAT

        - Return ONLY valid JSON.
        - Do NOT return Markdown.
        - Do NOT wrap the JSON in \`\`\`json.
        - Do NOT include any text before or after the JSON.
        - Do NOT add additional fields.

        Use exactly these fields:

        role
        atsScore
        strengths
        weaknesses
        suggestions
        missingSkills
        valueAddingSkills


        EXPECTED FORMAT:

        {
          "roleAnalysis": {
            "role": "${preferredJobRole}",
            "atsScore": 75,
            "strengths": [
              "Strong experience with relevant technologies"
            ],
            "weaknesses": [
              "Limited experience with cloud deployment"
            ],
            "suggestions": [
              "Add relevant cloud deployment projects"
            ],
            "missingSkills": [
              "Docker",
              "AWS",
              "TypeScript"
            ],
            "valueAddingSkills": [
              "React",
              "Node.js",
              "MongoDB",
              "Express.js"
            ]
          }
        }

        Return only the JSON object.
        `;


    // Send prompt to Gemini
    const analysisResult = await aiService(prompt);

    // Save / overwrite existing analysis
    const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
      {
        userId: userId,
        resumeId: req.resumeData._id,
      },
      {
        $set: {
          roleAnalysis: analysisResult.roleAnalysis,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: savedAnalysis,
    });
    
  } catch (err) {
    console.error("RESUME ANALYSIS ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};


export const getAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ userId: req.userId }).populate("userId", "username");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "No analysis found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};