import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const appointmentsDispensary = await prisma.appointment.findMany({
      where: {
        status: "dispensary", // Filter appointments where the status is "waiting"
      },
    });

    // Iterate through appointmentsToday
    for (let i = 0; i < appointmentsDispensary.length; i++) {
      const patientIC = appointmentsDispensary[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true, age: true, gender: true },
      });

      // Add patient details to the current appointment object
      appointmentsDispensary[i].patientDetails = patientDetails;

      // Fetch employer field from the Appointment table to see if mc button is needed or not
      const mcDetails = await prisma.appointment
        .findUnique({
          where: { id: appointmentsDispensary[i].id },
          select: { employer: true },
        })
        .then((result) => result?.employer);

      // Add mcDetails to the current appointment object
      appointmentsDispensary[i].mcDetails = mcDetails;

      // Fetch employer field from the Appointment table to see if letter button is needed or not
      const letterDetails = await prisma.appointment
        .findUnique({
          where: { id: appointmentsDispensary[i].id },
          select: { letterContent: true },
        })
        .then((result) => result?.letterContent);

      // Add letterDetails to the current appointment object
      appointmentsDispensary[i].letterDetails = letterDetails;
    }

    console.log(appointmentsDispensary);

    if (appointmentsDispensary.length === 0) {
      return res.status(404).json({ error: "No waiting appointments found" });
    }

    return res.json({ appointmentsDispensary });
  } catch (error) {
    console.error("Error filtering appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
