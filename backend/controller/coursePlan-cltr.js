import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import CoursePlan from "../models/coursePlanSchema.js";
import aiService from "../services/aiServices.js";

export const generateCoursePlan = async (req, res) => {
  try {
    const userId = req.userId;

    // User decides how many weeks they want to prepare
    const durationWeeks = 6  

    /* if (!durationWeeks) {
      return res.status(400).json({
        success: false,
        error: "Please provide the number of weeks"
      });
    }

    if (durationWeeks < 1) {
      return res.status(400).json({
        success: false,
        error: "Duration must be at least 1 week"
      });
    } */

    // Get latest resume analysis of the user
    const analysis = await ResumeAnalysis.findOne({
      userId: userId
    }).sort({ createdAt: -1 });

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

    const {role,strengths,weaknesses,missingSkills,valueAddingSkills} = roleAnalysis;

    // Create prompt for Gemini
    const prompt = `
      You are an expert career learning planner and technical mentor.

      Your task is to create a personalized ${durationWeeks}-week learning plan
      for a candidate who wants to become/job-ready for the following role:

      ROLE:
      ${role}

      The learning plan must be specifically designed for this role.

      Here is the candidate's existing resume analysis.

      STRENGTHS:
      ${JSON.stringify(strengths)}

      VALUE-ADDING SKILLS:
      ${JSON.stringify(valueAddingSkills)}

      WEAKNESSES:
      ${JSON.stringify(weaknesses)}

      MISSING SKILLS:
      ${JSON.stringify(missingSkills)}


      IMPORTANT LEARNING STRATEGY:

      The candidate already possesses some skills and strengths.

      Therefore, WEEK 1 must primarily focus on brushing up and strengthening
      the candidate's existing skills that are relevant to the target role.

      Use the STRENGTHS and VALUE-ADDING SKILLS to identify the technologies,
      concepts, frameworks, and fundamentals that are actually relevant to
      the target role.

      For example:

      If the target role is Frontend Developer and the value-adding skills
      contain:

      Python, Java, JavaScript, React.js, Angular, Vue

      do NOT blindly include all of them.

      Determine which skills are actually relevant to Frontend Developer.

      For example:

      JavaScript
      React.js
      Angular
      Vue

      may be relevant, while Python and Java may not be priorities.

      The LLM must perform this filtering itself.

      WEEK 1 should therefore focus on:

      - Revising relevant existing skills
      - Strengthening fundamentals
      - Refreshing important concepts
      - Identifying weak areas within already-known technologies
      - Preparing the candidate for the advanced topics in later weeks


      FROM WEEK 2 ONWARDS:

      Prioritize the candidate's weaknesses and missing skills.

      The learning progression should move from fundamentals to intermediate
      and then advanced concepts.

      Do NOT assume that every skill can be completed in one week.

      For example:

      CI/CD may require multiple weeks.

      Docker may require one or more weeks depending on the candidate's level.

      Kubernetes may require multiple weeks and should come after Docker
      and containerization fundamentals.

      Therefore, determine the appropriate amount of time for each topic
      based on:

      1. Complexity
      2. Prerequisites
      3. Importance for the target role
      4. Candidate's existing knowledge
      5. Candidate's weaknesses
      6. Candidate's missing skills
      7. Logical learning progression


      IMPORTANT:

      The user has requested exactly ${durationWeeks} weeks.

      You MUST generate exactly ${durationWeeks} weeks.

      Do not generate fewer or more weeks.

      Do NOT force the same number of sessions into every week.

      Some weeks may contain 2 sessions.

      Some weeks may contain 3 sessions.

      Some weeks may contain 5 sessions.

      The number of sessions should depend on the complexity and learning
      requirements of the topics.


      LEARNING ORDER:

      Week 1:
      Relevant existing skills + fundamentals + brushing up.

      Later weeks:
      Weaknesses + missing skills + advanced concepts.

      Always consider prerequisites.

      For example:

      Docker
          ↓
      Docker Compose
          ↓
      CI/CD
          ↓
      CI/CD with Docker
          ↓
      Deployment

      Do not teach advanced topics before their required fundamentals.


      SESSION REQUIREMENTS:

      Each session should represent a meaningful learning topic.

      For every session provide:

      - A clear title
      - Topics covered
      - Skills/concepts learned
      - Recommended learning materials

      Materials can include:

      - Official documentation
      - Documentation topics
      - Tutorials
      - Articles
      - Videos
      - Books
      - Practice resources

      Do not provide fake URLs.

      If you provide resources, use well-known resource names instead
      of inventing URLs.


      COURSE PLAN REQUIREMENTS:

      The course should be:

      - Personalized
      - Role-specific
      - Progressive
      - Practical
      - Realistic
      - Based on the candidate's existing skills
      - Based on the candidate's weaknesses
      - Based on missing skills
      - Focused on job readiness


      RETURN ONLY VALID JSON.

      Return exactly this structure:

      {
        "role": "${role}",
        "durationWeeks": ${durationWeeks},
        "weeks": [
          {
            "weekNumber": 1,
            "overview": "Short overview of what this week focuses on",
            "sessions": [
              {
                "title": "Session title",
                "topics": [],
                "skills": [],
                "materials": []
              }
            ]
          }
        ]
      }

      RULES:

      1. Generate exactly ${durationWeeks} weeks.

      2. Week numbers must start at 1 and end at ${durationWeeks}.

      3. Week 1 must prioritize relevant existing strengths and
        value-adding skills.

      4. Do not include irrelevant existing skills simply because they
        appear in the resume analysis.

      5. Later weeks should prioritize weaknesses and missing skills.

      6. Consider topic complexity when deciding how many weeks a topic
        requires.

      7. Do not use a fixed number of sessions per week.

      8. Sessions should represent meaningful learning units.

      9. Do not add projects, assignments, assessments, or exams.

      10. Do not add fields other than:
          role
          durationWeeks
          weeks
          weekNumber
          overview
          sessions
          title
          topics
          skills
          materials

      11. Return only valid JSON.
      `;

    console.log("GENERATING COURSE PLAN...");

    // Send prompt to Gemini
    const coursePlanResult = await aiService(prompt);

    //console.log("AI COURSE PLAN:", coursePlanResult);

    // Save / overwrite existing course plan
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
      message:"Internal Server Error"
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