"use strict";

const authController = require("./controllers/authController");

module.exports = (app) => {
  /** Auth Controller */
  app.route("/auth/login").post(authController.login);
  app.route("/auth/register").post(authController.register);
  app.route("/auth/otp").post(authController.validateOTP);
  app.route("/auth/resend").post(authController.resendOTP);

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
