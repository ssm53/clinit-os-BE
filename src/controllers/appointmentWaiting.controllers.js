import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const appointmentsWaiting = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["waiting", "Waiting"],
        },
      },
      orderBy: {
        arrivalTime: "desc", // Order by arrivalTime in descending order
      },
    });

    // Iterate through appointmentsToday
    for (let i = 0; i < appointmentsWaiting.length; i++) {
      const patientIC = appointmentsWaiting[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true, age: true, gender: true },
      });

      // Add patient details to the current appointment object
      appointmentsWaiting[i].patientDetails = patientDetails;
    }

    console.log(appointmentsWaiting);

    return res.json({ appointmentsWaiting });
  } catch (error) {
    console.error("Error filtering appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
