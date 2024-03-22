import jwt from "jsonwebtoken";
// import "dotenv/config";

const userAccessTokenSecret = process.env.USER_APP_SECRET;
const doctorAccessTokenSecret = process.env.DOCTOR_APP_SECRET;

export function signUserAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign({ payload }, userAccessTokenSecret, {}, (err, token) => {
      if (err) {
        reject("Something went wrong");
      }
      resolve(token);
    });
  });
}

export function signDoctorAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign({ payload }, doctorAccessTokenSecret, {}, (err, token) => {
      if (err) {
        reject("Something went wrong");
      }
      resolve(token);
    });
  });
}

export function verifyUserAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, userAccessTokenSecret, (err, payload) => {
      if (err) {
        const message =
          err.name == "JsonWebTokenError" ? "Unauthorized" : err.message;
        return reject(message);
      }
      resolve(payload);
    });
  });
}

export function verifyDoctorAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, doctorAccessTokenSecret, (err, payload) => {
      if (err) {
        const message =
          err.name == "JsonWebTokenError" ? "Unauthorized" : err.message;
        return reject(message);
      }
      resolve(payload);
    });
  });
}
