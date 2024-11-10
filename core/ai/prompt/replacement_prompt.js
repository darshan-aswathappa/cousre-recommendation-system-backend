const replacementPrompt = `

excluded list: special courses, directed study, thesis, projects, writing and reading courses, any courses with 1 or 0 credits assigned to them.

The following is a 4-semester course plan:

{coursePlan}

Please review this plan and replace any courses that are in the excluded list with alternative courses from the database. 
Excluded courses include: {excludedCourses}

Ensure the total credits are balanced and no courses have 0 or 1 credit, and avoid courses labeled as "special topics," "directed study," "writing," "thesis," or "project."

Return the updated course plan strictly in JSON format.
`;

module.exports = replacementPrompt;
