const getProfessorDetails = require("./professor-details-controller");

const ratings = require("@mtucourses/rate-my-professors").default;

const getProfessor = async (req, res, next) => {
  const courseName = req.query.courseName;
  const courseId = req.query.courseId;
  const professors = await getProfessorDetails(courseName, courseId);
  console.log(professors);

  const professorDetails = await Promise.all(
    professors.map(async (professorName) => {
      try {
        const teachers = await ratings.searchTeacher(
          professorName,
          "U2Nob29sLTY5Ng=="
        );
        if (teachers.length > 0) {
          const teacher = await ratings.getTeacher(teachers[0].id);

          return {
            name: `${teacher.firstName.toUpperCase()} ${teacher.lastName.toUpperCase()}`,
            rating: teacher.avgRating,
            difficulty: teacher.avgDifficulty,
            takeAgain: teacher.wouldTakeAgainPercent,
            dept: teacher.department,
          };
        } else {
          return {
            name: professorName,
            rating: "Not available",
            difficulty: "Not available",
            takeAgain: "Not available",
            dept: "Not available",
          };
        }
      } catch (error) {
        console.error(`Error fetching details for ${professorName}:`, error);
        return {
          name: professorName,
          rating: "Error fetching rating",
          difficulty: "Error fetching difficulty",
          takeAgain: "Error fetching take again percentage",
          dept: "Error fetching department",
        };
      }
    })
  );
  console.log(professorDetails);

  res.send(professorDetails);
};

module.exports = getProfessor;
