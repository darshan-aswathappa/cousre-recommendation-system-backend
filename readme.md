# CourseCraft Backend

## Overview

The CourseCraft Backend serves as the backbone of the Course Recommendation System, developed as a final project for NEU INFO6150 Web Design. 
It is designed to handle critical operations such as user authentication, data scraping, external API integrations, and database management.

### Group Members (in lexicographic order)

|        Name        |             EMail              |   NUID    |
|:------------------:|:------------------------------:|:---------:|
| Darshan Aswathappa | aswathappa.d@northeastern.edu  | 002339267 |
|   James Z. Zhang   |  zhang.jame@northeastern.edu   | 002475939 |
|   Nireeksha Huns   |    huns.n@northeastern.edu     | 002054783 |
|    Yanqing Lou     |    lou.yan@northeastern.edu    | 002083406 |
|    Zhilong Shen    |   shen.zhil@northeastern.edu   | 002470907 |

This backend follows a RESTful API design pattern, enabling seamless communication between the frontend and the server. 
Built with Node.js and Express.js, it ensures scalability, maintainability, and ease of integration.

## Key Features
- User Authentication and Authorization: 
  - Secure login and registration with password encryption using bcrypt.
  - Session management via tokens to enhance security.
- Data Scraping and Processing:
  - Scrapes and processes professor and course data to provide accurate recommendations.
- Course Recommendation System:
  - Integrates with OpenAI API to deliver personalized course suggestions.
- Resume Parsing:
  - Upload and analyze resumes to match users with relevant courses.
- Multi-role Support:
  - Supports Admin and User roles with specific features for each.
- Extensible Architecture:
  - Easily adaptable to add future features like subscription models or payment gateways.

## APIs
| Entry Point                                         | Method | Description                                                         |
|-----------------------------------------------------|--------|---------------------------------------------------------------------|
| /api/auth/check-auth                                | GET    | Verifies authentication status using a token.                       |
| /api/auth/signup                                    | POST   | Allows new users to sign up.                                        |
| /api/auth/login                                     | POST   | Authenticates users and returns a session token.                    |
| /api/auth/logout                                    | POST   | Logs out the user by invalidating their session.                    |
| /api/auth/verify-email                              | POST   | Verifies a user's email address.                                    |
| /api/auth/forgot-password                           | POST   | Initiates the forgot password process.                              |
| /api/auth/reset-password/:token                     | POST   | Resets the user's password using a token.                           |
| /api/auth/getAllUsers                               | GET    | Retrieves a list of all users.                                      |
| /api/auth/deleteUser/:userId                        | DELETE | Deletes a user based on their user ID.                              |
| /reupload-resume/:userId                            | PUT    | Deletes and allows reuploading of resume data for a user.           |
| /api/auth/get-user/:userId                          | GET    | Fetches details of a specific user by user ID.                      |
| /professors                                         | GET    | Retrieves a list of all professors.                                 |
| /professor                                          | GET    | Retrieves details of an individual professor.                       |
| /save-courses                                       | POST   | Saves course information to the database.                           |
| /resume-view/:userId                                | GET    | Displays a user’s resume data.                                      |
| /subject-bot                                        | POST   | Handles subject-related bot interactions.                           |
| /fetch-courses-recommendation                       | POST   | Fetches course recommendations based on resume match.               |
| /spring2025                                         | POST   | Scrapes spring 2025 courses.                                        |
| /course-information                                 | POST   | Fetches course-specific information.                                |
| /prof-scraper                                       | GET    | Scrapes professor data.                                             |
| /get-subjects                                       | GET    | Retrieves all NEU course subjects.                                  |
| /fetch-courses-recommendation/:userId/:resumeDataId | GET    | Fetches course recommendations for a specific user and resume data. |
| /upload-parse-resume/:userId                        | POST   | Uploads and parses a user’s resume.                                 |
 
## How to Run
### Run locally
1. Clone the repository
```shell
git clone https://github.com/darshan-aswathappa/cousre-recommendation-system-backend.git
```
2. Install all the dependencies
```shell
npm install
```
If production environment, run
```shell
npm install --only=production
```
3. Configure environmental environments and set external API keys in `/.env` if necessary
4. Run the backend
```shell
npm start run
```
### Run the backend in a Docker Container
#### Prerequisites
1. Install Docker and Docker Compose.
2. Ensure your .env file is properly configured with the required environment variables:
   - OPEN_API_TOKEN
   - ANTHROPIC_API_KEY
   - JWT_SECRET
   - MONGO_USERNAME
   - MONGO_PASSWORD
   - CLIENT_URL
#### Running in Development Mode
To start the application in **development mode**, run:
```shell
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
This will:
1. Run only a single replica
2. Mount the project directory `./` as a **bind volume** for live code changes:
```yaml
volumes:
  - ./:/app ro
  - /app/node_modules
```
This allows for hot-reloading, so changes made in the code are immediately reflected without rebuilding the image.
#### Running in Production Mode
To start the application in **production mode**, run:
```shell
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```
This will: 
1. Disable features like bind volumes to ensure that only the code in the built image is used, enhancing security and consistency.
2. Use a multi-replica deployment with:
   - **High Availability**: The service runs 5 replicas to handle traffic load.
    - **Fault Tolerance**: If a container fails, it restarts automatically.
    - **Zero Downtime Updates**: Updates are rolled out two containers at a time, with a 15-second delay.
3. Run the containers detached in the background with -d, suitable for long-running production services. 

## Backend Related Criteria
`3. Login pages - With password encryption(bcrypt)`
    Using `bcrypt` for password hashing in `authController.js`

`6. Session management`
    Using tokens to manage sessions.

`7. Data consistency`
    The data is consistent

`8. End-to-end transaction as per the project`
    The flow is complete.

`11. Backend tech a Node Js/ Express Js`
    Using Both Node.js and Express.js

`12. In the case of e-commerce use payment gateway API`
    This is not an e-commerce project, and we have yet to include subscriptions. 

`13. External APIs wherever is applicable`
    We are using OpenAI's API for vector embedding and Anthropic's API to provide textual result.

`14. Host the web application on the servers like Heroku etc. as a Bonus.`
    Hosting on DigitalOcean.

`15. Upload the project on Canvas and Git both and there should not be a major timestamp gap`
    Uploading both to Canvas and Git.

`16. CRUD is mandatory if your project has a storage requirement`
    CRUD is applied to e.g., User entities.

`17. Should have REST or MVC architecture`
    The backend follows a RESTful architecture, implementing REST principles for building APIs.

`18. Following git branching would add extra weightage`
    The project follows a Git branching model, with each contributor working on their own branch for specific features or tasks.

`19. There should be functionality-wise commits to git, i.e. as you add new functionality, you should push. Adding Readme and git ignore for node modules is mandatory`
    Check commit history for functionality-wise commits. This repo include this `readme.md` and a `.gitignore` file.

`20. Code documentation should be followed (Comments, naming convention)`
    Proper documentation and naming convention are enforced.

`21. Preference for database connectivity is MongoDB only but if there is a good reason then a database like SQL is OK.`
    We are using MongoDB and hosting it on DigitalOcean.