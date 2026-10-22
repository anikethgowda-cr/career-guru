import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import CoursePlan from "../models/coursePlanSchema.js";
import aiService from "../services/aiServices.js";

// Helper function to validate, sanitize, and normalize the AI output to match CoursePlan schema
const normalizeCoursePlan = (rawPlan, targetRole, durationWeeks = 6) => {
    const role = typeof rawPlan?.role === "string" && rawPlan.role.trim()
        ? rawPlan.role.trim()
        : targetRole || "Professional";

    const duration = Number(rawPlan?.durationWeeks) || durationWeeks || 6;
    const rawWeeks = Array.isArray(rawPlan?.weeks) ? rawPlan.weeks : [];

    const weeks = [];
    for (let w = 1; w <= duration; w++) {
        const foundWeek = rawWeeks.find((rw) => Number(rw?.weekNumber) === w) || rawWeeks[w - 1] || {};
        const overview = typeof foundWeek.overview === "string" && foundWeek.overview.trim()
            ? foundWeek.overview.trim()
            : `Comprehensive milestone curriculum and fundamentals for Week ${w}`;

        const rawSessions = Array.isArray(foundWeek.sessions) && foundWeek.sessions.length > 0
            ? foundWeek.sessions
            : [{
                title: `Week ${w} Core Concepts and Implementation`,
                topics: [`Introduction to Week ${w} concepts`, "Practical Implementation"],
                skills: [role],
                materials: [
                    {
                        name: `${role} - Week ${w} Overview`,
                        type: "YouTube",
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(role)}+tutorial+week+${w}`,
                        description: `Curated learning video resource for Week ${w}`
                    }
                ]
            }];

        const sessions = rawSessions.map((session, sIdx) => {
            const title = typeof session?.title === "string" && session.title.trim()
                ? session.title.trim()
                : `Session ${sIdx + 1}: ${overview}`;

            const topics = Array.isArray(session?.topics) && session.topics.length > 0
                ? session.topics.map((t) => String(t).trim()).filter(Boolean)
                : [title];

            const skills = Array.isArray(session?.skills) && session.skills.length > 0
                ? session.skills.map((s) => String(s).trim()).filter(Boolean)
                : [role];

            const rawMaterials = Array.isArray(session?.materials) ? session.materials : [];

            let materials = rawMaterials.map((mat, mIdx) => {
                const name = typeof mat?.name === "string" && mat.name.trim()
                    ? mat.name.trim()
                    : `${title} Resource ${mIdx + 1}`;

                let type = typeof mat?.type === "string" && mat.type.trim()
                    ? mat.type.trim()
                    : (mIdx === 0 ? "YouTube" : "Official Documentation");

                const validTypes = ["YouTube", "Official Documentation", "GitHub", "Research Paper", "Article", "Book", "Practice"];
                const matchedType = validTypes.find((t) => t.toLowerCase() === type.toLowerCase());
                type = matchedType || (mIdx === 0 ? "YouTube" : "Article");

                let url = typeof mat?.url === "string" && mat.url.trim() ? mat.url.trim() : "";
                if (!url || !url.startsWith("http")) {
                    url = type === "YouTube"
                        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`
                        : `https://www.google.com/search?q=${encodeURIComponent(name)}`;
                }

                const description = typeof mat?.description === "string" && mat.description.trim()
                    ? mat.description.trim()
                    : `Essential learning resource covering ${title} for ${role}.`;

                return { name, type, url, description };
            });

            // Ensure there is at least one YouTube material as the first item
            if (materials.length === 0) {
                materials = [
                    {
                        name: `${title} Video Tutorial`,
                        type: "YouTube",
                        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
                        description: `Educational video guide covering ${title}.`
                    },
                    {
                        name: `${title} Official Documentation`,
                        type: "Official Documentation",
                        url: `https://www.google.com/search?q=${encodeURIComponent(title)}+documentation`,
                        description: `Comprehensive reference materials for ${title}.`
                    }
                ];
            } else if (materials[0].type !== "YouTube" || !materials[0].url.includes("youtube.com")) {
                materials.unshift({
                    name: `${title} Video Tutorial`,
                    type: "YouTube",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`,
                    description: `Recommended video guide covering ${title}.`
                });
            }

            return { title, topics, skills, materials };
        });

        weeks.push({
            weekNumber: w,
            overview,
            sessions
        });
    }

    return { role, durationWeeks: duration, weeks };
};

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
                noAnalysis: true,
                message: "Resume analysis not found. Please upload and analyze your resume first."
            });
        }

        const roleAnalysis = analysis.roleAnalysis;

        if (!roleAnalysis) {
            return res.status(404).json({
                success: false,
                noAnalysis: true,
                message: "Role analysis not found. Please upload and analyze your resume first."
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
            advanced concepts. Always consider prerequisites.

            WEEK REQUIREMENTS:
            Generate exactly ${durationWeeks} weeks.
            Week numbers must be: 1, 2, 3, 4, 5, 6.
            Do not generate fewer or more weeks.
            The number of sessions per week should depend on topic complexity (typically 3-4 sessions).

            SESSION REQUIREMENTS:
            Every session must contain:
            - title
            - topics (array of strings)
            - skills (array of strings)
            - materials (array of objects)

            MATERIAL REQUIREMENTS:
            Every session must contain 2-4 useful learning resources.

            IMPORTANT YOUTUBE MATERIAL RULE:
            The FIRST material in EVERY session MUST ALWAYS be a YouTube video search query.
            materials[0].type MUST be exactly "YouTube".
            materials[0].url MUST be a YouTube search URL in the exact format:
            https://www.youtube.com/results?search_query=TOPIC+KEYWORDS
            (Replace spaces with + signs and use specific relevant search keywords).

            DO NOT fabricate or guess random YouTube video IDs like watch?v=...
            Using YouTube search URLs guarantees the link works and points to active content.

            REMAINING MATERIALS:
            Allowed resource types for materials[1+]:
            - "YouTube"
            - "Official Documentation"
            - "GitHub"
            - "Research Paper"
            - "Article"
            - "Book"
            - "Practice"

            Each material MUST contain all 4 fields:
            - name: Short informative title
            - type: One of the allowed types above
            - url: Working URL or official domain
            - description: Brief 1-2 sentence description of what the student will learn

            SCHEMA REQUIREMENTS:
            The generated JSON MUST strictly match this structure:
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
                                        "name": "YouTube Video Tutorial",
                                        "type": "YouTube",
                                        "url": "https://www.youtube.com/results?search_query=docker+compose+tutorial",
                                        "description": "Video walkthrough of core concepts"
                                    },
                                    {
                                        "name": "Official Documentation",
                                        "type": "Official Documentation",
                                        "url": "https://docs.docker.com",
                                        "description": "Official guide and reference"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            STRICT JSON RULES:
            1. Return ONLY valid JSON.
            2. Do not wrap in markdown or backticks.
            3. Do not add text outside the JSON.
            4. Include all ${durationWeeks} weeks.
        `;

        console.log("GENERATING COURSE PLAN...");

        const coursePlanResult = await aiService(prompt);

        // Normalize and validate the plan to guarantee complete schema compliance
        const normalizedPlan = normalizeCoursePlan(coursePlanResult, role, durationWeeks);

        const savedCoursePlan = await CoursePlan.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    userId: userId,
                    analysisId: analysis._id,
                    role: normalizedPlan.role,
                    durationWeeks: normalizedPlan.durationWeeks,
                    weeks: normalizedPlan.weeks
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
            message: "AI is under Maintenance. Please try again shortly."
        });
    }
};


export const showCoursePlan = async (req, res) => {
  try {
    const userId = req.userId;

    // Check whether course plan already exists (get the latest plan for the user)
    const coursePlan = await CoursePlan.findOne({
      userId: userId
    }).sort({ updatedAt: -1 }).populate("userId", "username");

    if (coursePlan) {
      return res.status(200).json({
        success: true,
        data: coursePlan,
        message: "Successfully retrieved course plan"
      });
    }

    // Get user's latest resume analysis
    const analysis = await ResumeAnalysis.findOne({ userId: userId }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        noAnalysis: true,
        message: "Resume analysis not found. Please upload and analyze your resume first."
      });
    }

    // Get role analysis
    const roleAnalysis = analysis.roleAnalysis;

    if (!roleAnalysis) {
      return res.status(404).json({
        success: false,
        noAnalysis: true,
        message: "Role analysis not found. Please upload and analyze your resume first."
      });
    }
    
    const { role, missingSkills } = roleAnalysis; 

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
      message: err.message || "Internal Server Error"
    });
  }
};