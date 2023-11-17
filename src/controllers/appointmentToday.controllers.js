import express from "express";
import { DateTime } from "luxon";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");

    let appointmentsToday = await prisma.appointment.findMany({
      where: {
        arrivalTime: {
          gte: malaysiaTime.startOf("day").toJSDate(),
          lte: malaysiaTime.endOf("day").toJSDate(),
        },
      },
    });

    // now here, i want to loop through appointmentsToday. for each appointmentsToday.patientIC, I then want to get details of patients where they have IC = appointmentsToady.patientIC, and add it to each object. i want to get name, age and gender from the patient table as seperate keys into each object

    // Iterate through appointmentsToday
    for (let i = 0; i < appointmentsToday.length; i++) {
      const patientIC = appointmentsToday[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true, age: true, gender: true },
      });

      // Add patient details to the current appointment object
      appointmentsToday[i].patientDetails = patientDetails;
    }

    console.log(appointmentsToday);

    if (appointmentsToday.length === 0) {
      return res.status(404).json({ error: "No appointments today yet" });
    }

    return res.json({ appointmentsToday });
  } catch (error) {
    console.error("Error filtering appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
