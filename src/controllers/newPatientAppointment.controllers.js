import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library
import { validateNewPatientAppt } from "../validators/newPatientAppt.js";
import io from "../socket/index.js";

const router = express.Router();

const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
const adjustedTime = malaysiaTime.plus({ hours: 8 });

router.post("/", async (req, res) => {
  const data = req.body;
  console.log(data);

  const validationErrors = validateNewPatientAppt(data);
  console.log(validationErrors);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });
  try {
    // add new patient to patient table
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        IC: data.IC,
        age: data.age,
        gender: data.gender,
        email: data.email,
        contact: data.contact,
        race: data.race,
      },
    });
    // make appt in appt table
    const appointment = await prisma.appointment.create({
      data: {
        date: adjustedTime, // Set the date to the current date in Malaysia
        reason: data.reason,
        patientIC: data.IC,
        status: "Waiting",
        arrivalTime: adjustedTime,
      },
    });

    // io.emit("new-patient-appointment", {
    //   appointment: { ...appointment, patientDetails: patient },
    // });

    return res.status(200).json({ appointment: appointment, patient: patient });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const formattedError = {};
      formattedError[`${err.meta.target[0]}`] =
        "This patient is already registered. Please click 'Exising Patient' button";

      return res.status(500).send({
        error: formattedError,
      }); // friendly error handling
    }
  }
});

export default router;
