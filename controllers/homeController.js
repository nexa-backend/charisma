"use strict";

const sanitasi = require("../services/sanitasi");
const helper = require("../services/helper");
const logger = require("../services/logger");
const koneksi = require("../services/db");
const response = require("../services/responseHelper");

exports.getAllSection = (req, res) => {
  try {
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      data: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  }
};
