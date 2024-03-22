import express from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { validateUserLogin } from "../validators/auth.js";
import { filter } from "../utils/common.js";
import { signDoctorAccessToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const validationErrors = validateUserLogin(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  const doctor = await prisma.doctor.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!doctor)
    return res.status(401).send({
      error: "Email address or password not valid",
    });

  const checkPassword = bcrypt.compareSync(data.password, doctor.password);
  if (!checkPassword)
    return res.status(401).send({
      error: "Email address or password not valid",
    });

  const doctorFiltered = filter(doctor, "id", "name", "email");
  const doctorAccessToken = await signDoctorAccessToken(doctorFiltered);
  // const refreshToken = await signRefreshToken(userFiltered);

  // // Update the user's refreshToken in the database
  // await prisma.user.update({
  //   where: {
  //     id: user.id,
  //   },
  //   data: {
  //     refreshToken,
  //   },
  // });

  const doctorId = doctor.id;
  return res.json({ doctorAccessToken, doctorId });
});

export default router;
