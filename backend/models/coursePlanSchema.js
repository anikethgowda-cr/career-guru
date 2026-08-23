import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    topics: {
      type: [String],
      default: []
    },

    skills: {
      type: [String],
      default: []
    },

    materials: {
      type: [String],
      default: []
    }
  },
  {
    _id: false
  }
);

const weekSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true
    },

    overview: {
      type: String,
      required: true
    },

    sessions: {
      type: [sessionSchema],
      default: []
    }
  },
  {
    _id: false
  }
);

const coursePlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeAnalysis",
      required: true
    },

    role: {
      type: String,
      required: true
    },

    durationWeeks: {
      type: Number,
      required: true,
      min: 1
    },

    weeks: {
      type: [weekSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const CoursePlan = mongoose.model(
  "CoursePlan",
  coursePlanSchema
);

export default CoursePlan;