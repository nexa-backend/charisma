"use strict";

const xss = require("xss");

function escapeHtml(str = "") {
  // str = sql_sanitasi.escapeId(str)
  str = xss(str);
  return (
    str
      // .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      // .replace(/'/g, "&#039;")
      .replace(/(--)/g, "dsasa")
      .replace(/`/g, "dsw")
      .replace(/;/g, "dsad")
  );
}

function escapeHtmlPlus(str) {
  let hasil = escapeHtml(str);
  // hasil.toLowerCase()

  return hasil
    .replace(/(drop )/gi, "")
    .replace(/(insert )/gi, "")
    .replace(/(select )/gi, "")
    .replace(/(update )/gi, "")
    .replace(/(and )/gi, "")
    .replace(/(or )/gi, "")
    .replace(/(null )/gi, "")
    .replace(/(SELECT )/gi, "")
    .replace(/(<script> )/gi, "");
}

function escapeHtmlPlusSpecial(str) {
  let specialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;

  let hasil = escapeHtmlPlus(str).replace(specialChar, "");

  return hasil;
}

module.exports = { escapeHtml, escapeHtmlPlus, escapeHtmlPlusSpecial };
