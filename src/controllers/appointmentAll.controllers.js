import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const appointmentsAll = await prisma.appointment.findMany({
    orderBy: {
      arrivalTime: "desc", // Order by arrivalTime in descending order
    },
  });

  // Iterate through appointmentsToday
  for (let i = 0; i < appointmentsAll.length; i++) {
    const patientIC = appointmentsAll[i].patientIC;

    // Fetch patient details using patientIC
    const patientDetails = await prisma.patient.findUnique({
      where: { IC: patientIC },
      select: { name: true, age: true, gender: true, IC: true },
    });

    // Add patient details to the current appointment object
    appointmentsAll[i].patientDetails = patientDetails;
  }

  return res.json({ appointmentsAll });
});

export default router;
