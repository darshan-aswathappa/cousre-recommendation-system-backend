const { parseResumeToJson } = require("../core/core");
const User = require("../database/model/user.model");
const { ObjectId } = require("mongodb");

const uploadParseResumeController = async (req, res) => {
  const userId = req.params.userId;
  console.log(req.file.buffer);
  const user = await User.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User does not exists" });
  }

  const resumeParsedData = await parseResumeToJson(req.file.buffer);
  user.userResumeParsedDetails = resumeParsedData;

  await user.save();

  return res.status(200).json({
    success: true,
    data: resumeParsedData,
  });
};

module.exports = uploadParseResumeController;
