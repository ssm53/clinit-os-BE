import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const appointmentsCompleted = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["completed", "Completed"],
        },
      },
    });

    // Iterate through appointmentsCompleted
    for (let i = 0; i < appointmentsCompleted.length; i++) {
      const patientIC = appointmentsCompleted[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true, age: true, gender: true },
      });

      // Add patient details to the current appointment object
      appointmentsCompleted[i].patientDetails = patientDetails;
    }

    console.log(appointmentsCompleted);

    return res.json({ appointmentsCompleted });
  } catch (error) {
    console.error("Error filtering appointments:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
