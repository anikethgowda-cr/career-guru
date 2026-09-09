import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import CoursePlan from "../models/coursePlanSchema.js";
import aiService from "../services/aiServices.js";

export const generateCoursePlan = async (req, res) => {
    try {
        const userId = req.userId;
        const durationWeeks = 6;

        const analysis = await ResumeAnalysis.findOne({
            userId: userId
        }).sort({ createdAt: -1 });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Resume analysis not found"
            });
        }

        const roleAnalysis = analysis.roleAnalysis;

        if (!roleAnalysis) {
            return res.status(404).json({
                success: false,
                message: "Role analysis not found"
            });
        }

        const {
            role,
            strengths,
            weaknesses,
            missingSkills,
            valueAddingSkills
        } = roleAnalysis;

        const prompt = `
              You are an expert career learning planner and technical mentor.

              Create a personalized ${durationWeeks}-week learning plan for a candidate
              preparing for the following role.

              ROLE:
              ${role}

              STRENGTHS:
              ${JSON.stringify(strengths)}

              VALUE-ADDING SKILLS:
              ${JSON.stringify(valueAddingSkills)}

              WEAKNESSES:
              ${JSON.stringify(weaknesses)}

              MISSING SKILLS:
              ${JSON.stringify(missingSkills)}

              LEARNING STRATEGY:

              Week 1 must primarily focus on relevant existing skills, fundamentals,
              revision and strengthening the candidate's current knowledge.

              Use STRENGTHS and VALUE-ADDING SKILLS to determine which technologies
              and concepts are actually relevant to the target role.

              Do not include irrelevant skills simply because they appear in the
              candidate's resume.

              From Week 2 onwards, prioritize:

              - Weaknesses
              - Missing skills
              - Important role-specific technologies
              - Advanced concepts

              Follow a logical progression from fundamentals to intermediate and
              advanced concepts.

              Always consider prerequisites.

              For example:

              Docker
              → Docker Compose
              → CI/CD
              → CI/CD with Docker
              → Deployment

              Do not teach advanced topics before their required fundamentals.

              WEEK REQUIREMENTS:

              Generate exactly ${durationWeeks} weeks.

              Week numbers must be:

              1, 2, 3, 4, 5, 6

              Do not generate fewer or more weeks.

              Do not use a fixed number of sessions per week.

              The number of sessions should depend on the complexity of the topics.

              SESSION REQUIREMENTS:

              Every session must contain:

              - title
              - topics
              - skills
              - materials

              MATERIAL REQUIREMENTS:

              Every session should contain 2-4 useful learning resources.

              Resources may include:

              - YouTube
              - Official Documentation
              - GitHub
              - Research Paper
              - Technical Article
              - Book
              - Practice Resource

              Only include resources that are genuinely relevant to the session.

              Prefer official and trusted resources.

              For programming technologies, prioritize official documentation,
              official tutorials and official GitHub repositories.

              RESOURCE URL RULES:

              Every URL must be a real URL.

              Never invent, guess or fabricate URLs.

              Do not create fake YouTube video URLs.

              Do not create fake GitHub repository URLs.

              Do not create fake research paper URLs.

              If a suitable resource cannot be verified, do not include it.

              Each material MUST contain:

              - name
              - type
              - url
              - description

              MATERIAL TYPE must be one of:

              "YouTube"
              "Official Documentation"
              "GitHub"
              "Research Paper"
              "Article"
              "Book"
              "Practice"

              SCHEMA REQUIREMENTS:

              The generated JSON MUST exactly match the following structure.

              {
                  "role": "${role}",
                  "durationWeeks": ${durationWeeks},
                  "weeks": [
                      {
                          "weekNumber": 1,
                          "overview": "Short overview of the week's learning focus",
                          "sessions": [
                              {
                                  "title": "Session title",
                                  "topics": [
                                      "Topic 1",
                                      "Topic 2"
                                  ],
                                  "skills": [
                                      "Skill 1",
                                      "Skill 2"
                                  ],
                                  "materials": [
                                      {
                                          "name": "Resource name",
                                          "type": "Official Documentation",
                                          "url": "https://real-url.com",
                                          "description": "Short explanation of the resource"
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }

              STRICT JSON RULES:

              1. Return ONLY valid JSON.

              2. Do not use markdown.

              3. Do not wrap the JSON inside a code block.

              4. Do not add explanations before or after the JSON.

              5. Generate exactly ${durationWeeks} objects inside "weeks".

              6. Every week must contain:
                - weekNumber
                - overview
                - sessions

              7. Every session must contain:
                - title
                - topics
                - skills
                - materials

              8. Every material must contain:
                - name
                - type
                - url
                - description

              9. "topics" must always be an array of strings.

              10. "skills" must always be an array of strings.

              11. "materials" must always be an array of objects.

              12. Do not add any fields that are not defined in this structure.

              13. Do not add:
                - projects
                - assignments
                - assessments
                - exams
                - difficulty
                - duration
                - prerequisites
                - resources
                - notes
                - exercises

              14. Do not change field names.

              15. Do not change the data types of fields.

              16. The final JSON must be directly compatible with the CoursePlan
                  MongoDB schema.
              `;

        console.log("GENERATING COURSE PLAN...");

        const coursePlanResult = await aiService(prompt);

        const savedCoursePlan = await CoursePlan.findOneAndUpdate(
            {
                userId: userId,
                analysisId: analysis._id
            },
            {
                $set: {
                    role: coursePlanResult.role,
                    durationWeeks: coursePlanResult.durationWeeks,
                    weeks: coursePlanResult.weeks
                }
            },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Course plan generated successfully",
            data: savedCoursePlan
        });

    } catch (err) {
        console.error("COURSE PLAN ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const showCoursePlan = async (req, res) => {
  try {
    const userId = req.userId;

    // Check whether course plan already exists
    const coursePlan = await CoursePlan.findOne({
      userId: userId
    }).populate("userId","username")

    if (coursePlan) {
      return res.status(200).json({
        success: true,
        data: coursePlan,
        message:"sucessfully retervied"
      });
    }

    // Get user's latest resume analysis
    const analysis = await ResumeAnalysis.findOne({userId: userId}).sort({createdAt: -1});

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Resume analysis not found"
      });
    }

    // Get role analysis
    const roleAnalysis = analysis.roleAnalysis;

    if (!roleAnalysis) {
      return res.status(404).json({
        success: false,
        message: "Role analysis not found"
      });
    }
    
    const { role,missingSkills } = roleAnalysis; 

    return res.status(404).json({
      success: false,
      message: "No Course Plan Found",
      data: {
        targetRole: role,
        missingSkills: missingSkills || []
      }
    });

  } catch (err) {
    console.error("SHOW COURSE PLAN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};