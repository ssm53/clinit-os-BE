import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import { DateTime } from "luxon"; // Import luxon library
import { validateNewPatientAppt } from "../validators/newPatientAppt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const validationErrors = validateNewPatientAppt(data);
  console.log(validationErrors);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });
  try {
    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
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
        date: malaysiaTime.toJSDate(), // Set the date to the current date in Malaysia
        reason: data.reason,
        patientIC: data.IC,
        doctor: data.doctor,
        status: "Waiting",
        arrivalTime: malaysiaTime.toJSDate(), // Convert to JavaScript Date object
      },
    });

    return res.status(200).json({ appointment: appointment, patient: patient });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
