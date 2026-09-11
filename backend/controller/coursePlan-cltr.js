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

            Every session must contain 2-4 useful learning resources.

            IMPORTANT MATERIAL ORDER RULE:

            The FIRST material in EVERY session MUST ALWAYS be a YouTube video.

            Therefore:

            materials[0].type MUST be exactly "YouTube".

            materials[0].url MUST be a direct YouTube video URL.

            The first material MUST be an actual educational YouTube video
            directly related to the session topic.

            YOUTUBE RECENCY REQUIREMENT:

            Every first YouTube video MUST have been published within the
            previous 2 years from the current date.

            Current date:
            ${new Date().toISOString().split("T")[0]}

            Therefore, do NOT recommend videos older than 2 years.

            Prefer videos published as recently as possible while still being
            high-quality and directly relevant to the topic.

            YOUTUBE POPULARITY REQUIREMENT:

            The first YouTube video should preferably:

            - Have a high number of views.
            - Have strong viewer engagement.
            - Come from a reputable educational or technical channel.
            - Be widely used or recommended for learning the topic.
            - Have clear and useful educational content.
            - Be directly relevant to the exact session topic.

            When multiple suitable videos exist, prioritize them in this order:

            1. Direct relevance to the session topic.
            2. Published within the last 2 years.
            3. High view count.
            4. Strong viewer engagement.
            5. Reputable educational/technical channel.
            6. Technical accuracy.
            7. Quality of explanation.

            Do NOT select an obscure or extremely low-view video if a
            popular and trustworthy alternative exists.

            Do NOT sacrifice relevance just because another video has more views.

            YOUTUBE URL REQUIREMENTS:

            Every first YouTube material MUST use one of these formats:

            https://www.youtube.com/watch?v=VIDEO_ID

            OR

            https://youtu.be/VIDEO_ID

            The URL MUST point directly to a YouTube video.

            DO NOT use:

            - YouTube channel URLs
            - YouTube playlist URLs
            - YouTube search URLs
            - YouTube homepage URLs
            - YouTube topic URLs
            - YouTube Shorts unless they are genuinely the best educational
              resource for the session
            - Fake URLs
            - Placeholder URLs
            - Example URLs
            - Made-up video IDs

            NEVER fabricate or guess a YouTube video ID.

            NEVER generate a fake YouTube URL.

            Only provide a YouTube URL when you can identify a real video.

            REAL-TIME RESOURCE REQUIREMENT:

            Learning resources should be current and relevant to modern
            versions of the technology whenever possible.

            For technologies that change frequently, prefer recently updated
            resources.

            Do not recommend outdated tutorials when a recent high-quality
            alternative exists.

            REMAINING MATERIALS:

            The remaining materials may contain other useful learning resources.

            Allowed resource types:

            - YouTube
            - Official Documentation
            - GitHub
            - Research Paper
            - Article
            - Book
            - Practice

            Only include resources that are genuinely relevant to the session.

            Prefer official and trusted resources.

            For programming technologies, prioritize:

            - Official documentation
            - Official tutorials
            - Official GitHub repositories
            - High-quality technical articles
            - Reputable educational YouTube videos
            - Current learning resources

            Each material MUST contain:

            - name
            - type
            - url
            - description

            MATERIAL TYPE must be exactly one of:

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
                                        "name": "YouTube Video Title",
                                        "type": "YouTube",
                                        "url": "https://www.youtube.com/watch?v=REAL_VIDEO_ID",
                                        "description": "Short explanation of the resource"
                                    },
                                    {
                                        "name": "Official Documentation",
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

            6. Week numbers MUST be exactly:
               1, 2, 3, 4, 5, 6.

            7. Every week must contain:
               - weekNumber
               - overview
               - sessions

            8. Every session must contain:
               - title
               - topics
               - skills
               - materials

            9. Every session must contain 2-4 materials.

            10. Every material must contain:
                - name
                - type
                - url
                - description

            11. "topics" must always be an array of strings.

            12. "skills" must always be an array of strings.

            13. "materials" must always be an array of objects.

            14. The FIRST material of EVERY session MUST be a YouTube video.

            15. For EVERY session:
                materials[0].type MUST equal "YouTube".

            16. For EVERY session:
                materials[0].url MUST be a direct YouTube video URL.

            17. Every first YouTube video MUST have been published within
                the previous 2 years.

            18. Prefer highly viewed and popular YouTube videos.

            19. Prefer reputable educational and technical channels.

            20. Prefer recent videos when multiple videos have similar quality.

            21. Never use a video older than 2 years for materials[0].

            22. Never use a YouTube channel, playlist, search page or homepage
                as materials[0].

            23. Never fabricate, guess or invent YouTube video IDs.

            24. Never generate fake or placeholder URLs.

            25. The order of materials is important:

                materials[0] = recent YouTube video

                materials[1+] = other relevant learning resources

            26. Do not add any fields that are not defined in this structure.

            27. Do not add:

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

            28. Do not change field names.

            29. Do not change the data types of fields.

            30. The final JSON must be directly compatible with the
                CoursePlan MongoDB schema.
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
    const userId = req.userId

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