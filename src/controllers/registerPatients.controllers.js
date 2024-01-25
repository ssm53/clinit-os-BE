import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { validatePatientRegistration } from "../validators/registerPatients.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const validationErrors = validatePatientRegistration(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  prisma.patient
    .create({
      data: {
        ...data,
      },
    })
    .then((patient) => {
      return res.json(patient);
    })
    .catch((err) => {
      throw err;
    });
});

export default router;
