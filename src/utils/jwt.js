import jwt from "jsonwebtoken";
// import "dotenv/config";

const userAccessTokenSecret = process.env.USER_APP_SECRET;
// const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

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