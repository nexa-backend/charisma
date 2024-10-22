"use strict";

require("dotenv").config();
const moment = require("moment");
moment.locale("id");
const jwt = require("jsonwebtoken");

const sanitasi = require("../services/sanitasi");
const helper = require("../services/helper");
const logger = require("../services/logger");
const koneksi = require("../services/db");
const response = require("../services/responseHelper");

const { JWT_SIGNATURE_KEY = "inisalahliatnyadienv" } = process.env;

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SIGNATURE_KEY, {
    expiresIn: "30d",
  });
};

/**
 * 1. step login,
 * jika hanya menggunakan email maka kirim otp ke email baru validasi otp dan dapat token jwt
 * jika ada access token maka langsung dapat token jwt
 *
 * 2. step register using login (jika tidak ada data member pada tb_member),
 * sama jika hanya email kirim otp lalu validasi otp dan masuk ke langkah lengkapi data
 * jika ada access token lanjut langsung ke lengkapi data
 */

exports.login = async (req, res) => {
  try {
    const body = {
      email: req.body.email ? sanitasi.escapeHtmlPlus(req.body.email) : "",
      fcmId: req.body.fcm_id ? req.body.fcm_id : "",
    };

    const accessToken = sanitasi.escapeHtmlPlus(req.body.access_token) ?? "";

    for (const key in body) {
      // console.log(body[key])
      if (body[key] == "") {
        return response.jsonBadRequest(`field ${key} harus di isi`, res);
      }
    }

    const isValid = helper.validEmail(body.email);
    if (isValid == false) return response.jsonBadRequest("Invalid email", res);

    const queryGetMember = `SELECT m.id, m.email FROM tb_members m WHERE m.email = '${body.email}' LIMIT 1`;

    const dataMember = await koneksi.query(queryGetMember);
    if (!dataMember) {
      return response.jsonError("Error get data member", res);
    }

    if (dataMember.length < 1) {
      // lempar ke halaman lengkapi
      if (accessToken) {
        const queryInsertMember = `INSERT INTO tb_members (email)
                                  VALUES ('${body.email}'); `;
        const dataInsertMember = await koneksi.query(queryInsertMember);

        if (!dataInsertMember) {
          return response.jsonBadRequest(
            "Failed",
            res,
            "Gagal Insert member auth"
          );
        }

        return response.jsonBerhasil(
          { status: "Register" },
          res,
          "Silahkan lengkapi data"
        );
      } else {
        const generateOTP = helper.randomNumber(9, 6);
        const sendMail = await helper.sendEmailOTP(generateOTP, body.email);

        if (!sendMail) {
          return response.jsonBadRequest("Failed", res, "Failed to send OTP");
        }

        const queryInsertMember = `INSERT INTO tb_members (email, otp, otp_expired )
                                  VALUES ('${
                                    body.email
                                  }', '${generateOTP}', '${moment()
          .add(10, "minutes")
          .format("YYYY-MM-DD HH:mm:ss")}' ); `;
        const dataInsertMember = await koneksi.query(queryInsertMember);

        if (!dataInsertMember) {
          return response.jsonBadRequest(
            "Failed",
            res,
            "Gagal Insert member auth"
          );
        }
        const dataResponse = {
          email: body.email,
          otp: generateOTP,
          otp_expired: moment()
            .add(10, "minutes")
            .format("YYYY-MM-DD HH:mm:ss"),
          status: "OTP",
        };
        return response.jsonBerhasil(dataResponse, res, "Berhasil kirim OTP");
      }
    } else {
      // create token

      if (accessToken) {
        const token = createToken({
          id: dataMember[0].id,
          email: dataMember[0].email,
        });
        const queryUpdate = `UPDATE tb_members
                            SET token = '${token}', 
                            update_at = '${moment().format(
                              "YYYY-MM-DD HH:mm:ss"
                            )}'
                            WHERE id = '${dataMember[0].id}'`;
        const dataUpdate = await koneksi.query(queryUpdate);

        if (!dataUpdate) {
          return response.jsonError("Failed update data", res);
        }

        const dataResponse = {
          email: body.email,
          status: "Login",
          token: token,
        };
        return response.jsonBerhasil(dataResponse, res, "Berhasil login");
      } else {
        const generateOTP = helper.randomNumber(9, 6);
        const sendMail = await helper.sendEmailOTP(generateOTP, body.email);

        if (!sendMail) {
          return response.jsonBadRequest("Failed", res, "Failed to send OTP");
        }

        const queryUpdate = `UPDATE tb_members
                            SET otp = '${generateOTP}', 
                            otp_expired = '${moment()
                              .add(10, "minutes")
                              .format("YYYY-MM-DD HH:mm:ss")}',
                            update_at = '${moment().format(
                              "YYYY-MM-DD HH:mm:ss"
                            )}'
                            WHERE id = '${dataMember[0].id}'`;
        const dataUpdate = await koneksi.query(queryUpdate);

        if (!dataUpdate) {
          return response.jsonError("Failed update data", res);
        }
        const dataResponse = {
          email: body.email,
          otp: generateOTP,
          otp_expired: moment()
            .add(10, "minutes")
            .format("YYYY-MM-DD HH:mm:ss"),
          status: "OTP",
        };
        return response.jsonBerhasil(dataResponse, res, "Berhasil kirim OTP");
      }
    }
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

exports.validateOTP = async (req, res) => {
  try {
    const body = {
      email: sanitasi.escapeHtmlPlus(req.body.email) ?? "",
      otp: sanitasi.escapeHtmlPlus(req.body.otp) ?? "",
    };

    for (const key in body) {
      // console.log(body[key])
      if (body[key] == "") {
        return response.jsonBadRequest(`field ${key} harus di isi`, res);
      }
    }

    const thisTime = moment().format("YYYY-MM-DD HH:mm:ss");

    const queryCheckOTP = `SELECT m.id, m.email, m.otp 
                              FROM tb_members m 
                              WHERE m.email = '${body.email}' 
                              AND m.otp = '${body.otp}'
                              AND m.otp_expired > '${thisTime}'`;

    const dataCheck = await koneksi.query(queryCheckOTP);

    if (!dataCheck || dataCheck < 1) {
      return response.jsonBadRequest("OTP salah atau sudah kadaluarsa", res);
    }

    const queryCheckDetail = `SELECT md.id_member FROM tb_member_details md WHERE md.id_member = '${dataCheck[0].id}'`;
    const dataCheckDetail = await koneksi.query(queryCheckDetail);

    if (dataCheckDetail.length < 1) {
      return response.jsonBerhasil(
        { status: "Register" },
        res,
        "Berhasil, silahkan lengkapi data"
      );
    } else {
      const token = {
        id: dataCheck[0].id,
        email: body.email,
      };

      const queryUpdate = `UPDATE tb_members 
                          SET token = '${token}', update_at = '${thisTime}' 
                          WHERE id = '${dataCheck[0].id}'`;
      const updateData = await koneksi.query(queryUpdate);

      if (!updateData) {
        return response.jsonError("Gagal update token", res);
      }

      const dataResponse = {
        email: body.email,
        token: token,
        status: "Login",
      };
      return response.jsonBerhasil(dataResponse, res, "Berhasil login");
    }
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

exports.resendOTP = async (req, res) => {
  try {
    const body = {
      email: req.body.email ? sanitasi.escapeHtmlPlus(req.body.email) : "",
    };

    for (const key in body) {
      // console.log(body[key])
      if (body[key] == "") {
        return response.jsonBadRequest(`field ${key} harus di isi`, res);
      }
    }

    if (body.email != "") {
      let isValid = helper.validEmail(body.email);
      if (isValid == false)
        return response.jsonBadRequest("Invalid email", res);
    }

    const generateOTP = helper.randomNumber(9, 6);

    const sendMail = await helper.sendEmailOTP(generateOTP, body.email);
    if (!sendMail) {
      return response.jsonBadRequest("Failed", res, "Gagal mengirim email OTP");
    }

    return response.jsonBerhasil("OTP", res, "Berhasil kirim OTP");
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

/**
 * register ini dari halaman lengkapi data
 * insert ke tb member dan tb member_detail
 * setelah insert dapat token
 */
exports.register = async (req, res) => {
  try {
    const body = {
      email: sanitasi.escapeHtmlPlus(req.body.email) ?? "",
      name: sanitasi.escapeHtmlPlus(req.body.name) ?? "",
      phone: sanitasi.escapeHtmlPlus(req.body.phone) ?? "",
      birth_date: moment(req.body.birth_date).format("YYYY-MM-DD") ?? "",
      gender: sanitasi.escapeHtmlPlus(req.body.gender) ?? "",
      city: sanitasi.escapeHtmlPlus(req.body.city) ?? "",
      job: sanitasi.escapeHtmlPlus(req.body.job) ?? "",
      pin: sanitasi.escapeHtmlPlus(req.body.pin) ?? "",
    };

    for (const key in body) {
      // console.log(body[key])
      if (body[key] == "") {
        return response.jsonBadRequest(`field ${key} harus di isi`, res);
      }
    }
    let isValid = helper.validEmail(body.email);
    if (isValid == false) return response.jsonBadRequest("Invalid email", res);
    if (isNaN(body.pin)) return response.jsonBadRequest("Invalid pin", res);

    //check email exist ?
    const queryCheckMember = `SELECT m.id, m.email FROM tb_members m WHERE m.email = '${body.email}' LIMIT 1`;
    const dataCheckMember = await koneksi.query(queryCheckMember);

    if (!dataCheckMember || dataCheckMember < 1) {
      return response.jsonBadRequest(
        "Email belum terdaftar, silahkan kembali ke halaman awal",
        res
      );
    }

    const token = createToken({
      id: dataCheckMember[0].id,
      email: dataCheckMember[0].email,
    });

    // insert data detail and update data member
    let query = [];
    const queryUpdateData = `UPDATE tb_members 
                            SET
                             token = '${token}',
                             update_at = '${moment().format(
                               "YYYY-MM-DD HH:mm:ss"
                             )}'
                            WHERE
                             id = '${dataCheckMember[0].id}'`;
    query.push(queryUpdateData);

    const queryInsertData = `INSERT INTO tb_member_details (id_member,"name",phone, birth_date, gender,city,job)
                              VALUES ('${dataCheckMember[0].id}', '${body.name}', '${body.phone}', '${body.birth_date}', '${body.gender}', '${body.city}', '${body.job}')`;
    query.push(queryInsertData);

    const data = await koneksi.query_transaksional(query);

    if (data == "Error") {
      return response.jsonBadRequest("Gagal melengkapi data member", res);
    }

    const dataResponse = {
      email: body.email,
      token: token,
      status: "Login",
    };

    return response.jsonBerhasil(dataResponse, res, "Berhasil masuk");
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
