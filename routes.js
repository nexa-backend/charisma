"use strict";

const auth = require("./controllers/authController");

const authorize = require("./middlewares/authorize");

module.exports = (app) => {
  /** Auth Controller */
  app.route("/auth/login").post(auth.login);
  app.route("/auth/register").post(auth.register);
  app.route("/auth/otp").post(auth.validateOTP);
  app.route("/auth/resend").post(auth.resendOTP);

  /** Home Controller */

  /** main routes always on the below of other routes */
  app.route("/").get((req, res) => {
    res.status(200).json({
      metadata: {
        status: 200,
        message: "API KARISMA Mobile ready to use!",
      },
      response: {
        data: {
          name: "Backend KARISMA Mobile",
        },
      },
    });
  });

  app.use((req, res) => {
    console.log("url", req.url);
    res.status(404).json({
      metadata: {
        status: 404,
        message: "FAIL",
      },
      response: {
        data: {
          name: "ROUTE NOT FOUND",
          message: "Are you lost?",
        },
      },
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      metadata: {
        status: 500,
        message: "ERROR",
      },
      response: {
        data: {
          name: "InternalServerError",
          message: err.message,
          stack: err.stack,
        },
      },
    });
  });
};
