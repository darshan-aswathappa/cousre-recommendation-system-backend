const User = require("../database/model/user.model");
const { ObjectId } = require("mongodb");

const deleteResumeDataController = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: new ObjectId(userId) });
    if (user) {
      user.resumeData = null;
      user.userResumeParsedDetails = null;
      user.selectedCourses = "";
      await user.save();
      res.status(200).json({ success: true, message: "Resume Data cleared" });
    }
  } catch (error) {
    console.log("Internal Server Error ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = deleteResumeDataController;
