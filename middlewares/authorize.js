const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { JWT_SIGNATURE_KEY = "inisalahsecretnyaliatenv" } = process.env;
const koneksi = require("../services/db");

exports.authUser = async function (req, res, next) {
  try {
    const token = req.headers["token"];
    const payload = jwt.verify(token, JWT_SIGNATURE_KEY);

    // cek token
    const queryCek = `SELECT id, email, token 
    FROM tb_members 
    WHERE id = ${payload.id} AND token = '${token}'`;

    const dataToken = await koneksi.query(queryCek);
    if (dataToken.length < 1) {
      return res.status(401).json({
        metadata: {
          status: 401,
          message: "Token invalid",
        },
        response: {
          name: "UNAUTHORIZED",
        },
      });
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      metadata: {
        status: 401,
        message: err.message,
      },
      response: {
        name: "UNAUTHORIZED",
      },
    });
  }
};
