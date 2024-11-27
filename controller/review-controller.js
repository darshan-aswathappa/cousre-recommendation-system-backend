const User = require("../database/model/user.model");
const { ObjectId } = require("mongodb");

const resumeViewController = async (req, res) => {
  const id = req.params.userId;

  try {
    const user = await User.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    res.status(200).json({
      success: true,
      resume: user.userResumeParsedDetails,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = resumeViewController;
