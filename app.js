require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

// Before hosting the API to the server, we need to setup the .env either in CLI or in GUI
// => CLI - heroku config:set JWT_LIFETIME=30d
// we need to do like this for every Environmental variables.

// GUI - settings => config vars! => More => Restart All dynos

// Extra-Security Packages!
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1); //Enable if we are behind a reverse proxy (Heroku, Bluemix, AWS ELS, Nginx)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 Minutes
    max: 100, //Limit each IP to 100 requests per windowMS
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// connectDB
const connectDB = require("./db/connect");

// Importing the Authentication middleware.
const authenticateUser = require("./middleware/authentication");

// Routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

app.use("/api/v1/auth", authRouter);

// Show the jobs content, only if it is authenticated by using this middleware
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();


// Setting up our own API documentation using swagger UI, with the help of postman!
// When we want the documnetation in our domain links => 

// 1. Export the whole folder of API' requests to the respective folder!
// 2.Formatting the exported JSON file using APIMATIC.io. and import it to Apimatic , twerk some setting!!
// 3. Export API - OpenAPI v3.0(YAML) in Apimatic
// 4. For testing - Open Swagger editor and paste all the exported API code
// 5. in order to remove id's in the API endpoint, use

// Need "swagger-ui-express" and "yamljs" Packages!

```yaml
/jobs/{id}:
  parameters:
    - in: path
      name: id
      schema:
        type: string
      required: true
      description: the job id
```;

// 6. to make that SwaggerUI into the production one, we must create a file calles swagger.yaml and paste all the exported API code

// We must Also import packages in the app.js => 
// const swaggerUI = require("swagger-ui-express")
// const YAML = require("yamljs")
// const swaggerDocument = YAML.load("./filename")
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// 7. =>
// app.get("/", (req, res) => {
//   res.send("<h1>Jobs APi</h1><a href="/api-docs">Documentation</a>")
// })