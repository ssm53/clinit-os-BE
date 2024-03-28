import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const revenueDetails = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["completed", "Completed"],
        },
      },
    });

    // Iterate through appointmentsCompleted
    for (let i = 0; i < revenueDetails.length; i++) {
      const patientIC = revenueDetails[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true },
      });

      // Add patient details to the current appointment object
      revenueDetails[i].patientDetails = patientDetails;
    }

    return res.json({ revenueDetails });
  } catch (error) {
    console.error("Error getting revenue details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
