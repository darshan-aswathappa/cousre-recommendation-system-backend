const scrapeProfessorPage = require("../utils/scrape-professor");

const scrapeProfessorController = async (req, res) => {
  const name = req.query.name;
  try {
    const response = await scrapeProfessorPage(name);
    res.status(200).send(response);
  } catch (error) {
    res.status(400).send({ message: error });
  }
};

module.exports = scrapeProfessorController;
