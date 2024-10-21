const process = require("node:process");
// const env = process.env;

var environments = {};

environments.development = {
  environment: "DEVELOPMENT",
  rahasiaChat: "xmarmut.com/kucingpoi.care/cornhub.com",
  secretToken: "beli_ketupat_beli_pepaya_|_ya_ndak_tahu_kok_tanya_saya",
  tokenApp:
    "https://minio.nexa.net.id/erpnexa/awas_jangan_dibuka-1672892902.mp4",
  tokenExpired: "90d",
};

environments.production = {
  environment: "PRODUCTION",
  rahasiaChat: "xmarmut.com/kucingpoi.care/cornhub.com",
  secretToken: "beli_ketupat_beli_pepaya_|_ya_ndak_tahu_kok_tanya_saya",
  tokenApp:
    "https://minio.nexa.net.id/erpnexa/awas_jangan_dibuka-1672892902.mp4",
  tokenExpired: "90d",
};

var currentEnvironment =
  typeof process.env.NODE_ENV == "string" ? process.env.NODE_ENV : "";
var environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.test;

module.exports = environmentToExport;
