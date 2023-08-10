require("dotenv").config();
const express = require("express");
const { StatusCodes } = require("http-status-codes");

const NotFound = require("./middlewares/NotFound");
const ErrorHandler = require("./middlewares/ErrorHandler");
const EstablishConnection = require("./utils/Connect");
const JobRouter = require("./routes/Jobs");
const UserRouter = require("./routes/User");

// extra security packages

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimitter = require("express-rate-limit");

// Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./docs/swagger.yaml");

app = express();

// IF API is behind reverse proxy i.e. hosted on heroku etc
app.set("trust proxy", 1);

app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
  res.send('<h1>API Documentation</h1><a href="/api/v1/docs">click here</a>');
});
app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(
  rateLimitter({
    windowMs: 15 * 60 * 100, //15 mins
    max: 2,
  })
);

// Routes
app.use("/api/v1/job", JobRouter);
app.use("/api/v1/user", UserRouter);

// Middlewares
app.use(NotFound);
app.use(ErrorHandler);

const port = process.env.PORT || 3000;

const startApp = async () => {
  try {
    await EstablishConnection(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`Job search server is listening on port ${port}...`);
    });
  } catch (err) {
    console.log(err);
  }
};

startApp();
