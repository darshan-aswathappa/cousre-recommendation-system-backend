const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    number: {
      type: String,
    },
    subjects: {
      type: String,
    },
    credits: {
      type: String,
    },
    description: {
      type: String,
    },
    prerequisites: {
      type: String,
      required: false,
    },
    corequisites: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CourseModel = mongoose.model("Course", CourseSchema);
module.exports = CourseModel;
