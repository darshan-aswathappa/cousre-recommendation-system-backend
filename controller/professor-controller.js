const ratings = require("@mtucourses/rate-my-professors").default;

const getProfessor = async (req, res, next) => {
  const name = req.query.name;
  const teachers = await ratings.searchTeacher(name, "U2Nob29sLTY5Ng==");
  const teacher = await ratings.getTeacher(teachers[0].id);
  res.send({
    name:
      teacher.firstName.toUpperCase() + " " + teacher.lastName.toUpperCase(),
    rating: teacher.avgRating,
    difficulty: teacher.avgDifficulty,
    takeAgain: teacher.wouldTakeAgainPercent,
  });
};

module.exports = getProfessor;
