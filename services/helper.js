"use strict";

const { format } = require("util");
const dotenv = require("dotenv");
const moment = require("moment");
dotenv.config();

const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

//Create random string function
exports.randomString = function (length) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];

  return result;
};

//create random number function
exports.randomNumber = function (numberlength = 9, length = 1) {
  let chars = "";
  for (let i = 0; i < parseInt(numberlength); ++i) chars += i.toString();
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];

  return result;
};

exports.groupBy = function (list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

exports.isNumeric = function (value) {
  return /^-?\d+$/.test(value);
};

exports.isValidPhoneNumber = function (value) {
  //62 895-073-996
  let validPhone = /^(^[62]\s?|^0)(\d{2,4}-?){2}\d{2,4}$/g.test(value);
  let validNumber = /^-?\d+$/.test(value);

  if (validPhone == true && validNumber == true) {
    return true;
  } else {
    return false;
  }
};

exports.validEmail = function (email) {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== "" && email.match(emailFormat)) {
    return true;
  }

  return false;
};

exports.validEmailAdvance = function (email) {
  const emailRegex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;
  return emailRegex.test(email);
};

exports.formatUang = function (nominal, denominator = 1) {
  const amount = (nominal / denominator).toFixed(2);
  const currencyCode = "IDR";

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currencyCode,
    // currencyDisplay: 'symbol' // Display currency symbol instead of code
  }).format(amount);

  // console.log(formattedAmount)

  return formattedAmount;
};

exports.stripHtmlTags = function (input) {
  return input.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, ""); // This regular expression matches and removes HTML tags
};

exports.formatDesimal = function (amount, denominator = 1) {
  const nominal = (amount / denominator).toFixed(2);
  const currencyCode = "IDR";

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    // currency: currencyCode,
    // currencyDisplay: 'symbol' // Display currency symbol instead of code
  }).format(nominal);

  // console.log(formattedAmount)

  return formattedAmount;
};

exports.isValidKtp = (ktp) => {
  ktp = ktp.replace(/[ .\-)(]/g, "");
  if (ktp.toString().match(/^\d{16}$/g)) {
    return true;
  } else {
    return false;
  }
};

exports.sanitizeDatetime = (input) => {
  // Check if input is "00000" and handle accordingly
  if (input === "0" || input === "00000" || input === "00-00-0000") {
    return null; // or a default datetime, depending on your requirements
  }

  // Use a library like moment.js for parsing and validating datetimes
  // Example using moment.js:

  const parsedDatetime = moment(input, "YYYY-MM-DDTHH:mm:ss", true); // Adjust the format as needed

  // Check if the datetime is valid
  if (parsedDatetime.isValid()) {
    return parsedDatetime.toISOString(); // or any other desired format
  } else {
    return null; // Handle invalid datetime input
  }
};

exports.haversineDistance = (lat1, lon1, lat2, lon2, isMeter) => {
  const R = 6371; // Radius of the Earth in kilometers
  const degToRad = (deg) => deg * (Math.PI / 180);

  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (isMeter) {
    return d * 1000; // Convert kilometers to miles
  } else {
    return d; // Return distance in kilometers
  }
};

exports.getUserFromGoogle = (accessToken) => {
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  oauth2.userinfo.get(function (err, res) {
    if (err) {
      console.log(err);
      return "";
    } else {
      console.log(res);
      return res;
    }
  });
};

exports.sendEmailOTP = async (otp, email) => {
  try {
    // Send emails to users
    let info = await transporter.sendMail({
      from: "testergmedia@gmail.com",
      to: email,
      subject: "OTP SIGN IN CHARISMA",
      html: `<p>Your OTP: ${otp}</p>`,
    });
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email: ", error);
  }
};
