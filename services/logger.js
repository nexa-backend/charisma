"use strict";

const winston = require("winston");
const { SeqTransport } = require("@datalust/winston-seq");
const configku = require("../middlewares/config");
require("dotenv").config();
const process = require("node:process");

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    /* application: 'your-app-name' */
  },
  transports: [
    // new winston.transports.Console({
    //     format: winston.format.simple(),
    // }),

    new SeqTransport({
      serverUrl: "https://matadewa.nexagroup.id",
      apiKey: "J6dqfWcEs6RqS3tT7Az0",
      onError: (e) => {
        console.error(e);
      },
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

exports.log = function (
  fn,
  response = "",
  id_controller = "",
  idcust = "",
  req = ""
) {
  let nama = "";

  if (process.env.ENV == "production") {
    nama = process.env.NAMA_APP + "Prod";
  } else {
    nama = process.env.NAMA_APP + "DEV";
  }

  let log_req = {
    header: req?.headers || "",
    body: req?.body || "",
  };

  logger.info(
    "Project {nama}, Api {controller}, Id_controller {id_controller}, User {idcust}, Request {request}, Log {log}",
    {
      nama: nama,
      controller: fn,
      log: response,
      id_controller: id_controller,
      idcust: idcust,
      request: log_req || "",
    }
  );
  // const taskLogger = logger.child({ activity: fn });
  // console.log(fn, request, response, type)

  // taskLogger.debug(
  //    "{request} => {response}",
  //    {
  //        request: "yesss",
  //        response: "tes"
  //    });
};

exports.error = function (
  fn,
  response = "",
  id_controller = "",
  idcust = "",
  req = ""
) {
  let nama = "";

  if (process.env.ENV == "production") {
    nama = process.env.NAMA_APP + "Prod";
  } else {
    nama = process.env.NAMA_APP + "DEV";
  }

  let log_req = {
    header: req?.headers || "",
    body: req?.body || "",
    query: req?.query || "",
    url: req?.url || "",
  };

  logger.error(
    "Project {nama}, Api {controller}, Id_controller {id_controller}, User {idcust}, Request {request}, Log {log}",
    {
      nama: nama,
      controller: fn,
      log: response,
      id_controller: id_controller,
      idcust: idcust,
      request: log_req || "",
    }
  );
  // const taskLogger = logger.child({ activity: fn });
  // console.log(fn, request, response, type)

  // taskLogger.debug(
  //    "{request} => {response}",
  //    {
  //        request: "yesss",
  //        response: "tes"
  //    });
};

exports.log_custom = function (text, data) {
  let nama = "";

  if (configku.environment == "PRODUCTION") {
    nama = `${process.env.APP_NAME}`;
  } else {
    nama = "Karisma Dev";
  }

  //data = Object.assign("nama", nama)

  data.nama = nama;

  //console.log(data)

  logger.info("Project {nama}, " + text, data);
};
