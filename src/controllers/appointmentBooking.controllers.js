import express from "express";
import { DateTime } from "luxon";
import prisma from "../utils/prisma.js";

const router = express.Router();

// get part patient info for consultation page
router.get("/", async (req, res) => {
  try {
    // need to get appointment where stataus is Bookng

    const appointmentsBooking = await prisma.appointment.findMany({
      where: {
        status: {
          in: ["booking", "Booking"],
        },
      },
      orderBy: {
        date: "desc", // Order by id in descending order
      },
    });

    // Iterate through appointmentsToday
    for (let i = 0; i < appointmentsBooking.length; i++) {
      const patientIC = appointmentsBooking[i].patientIC;

      // Fetch patient details using patientIC
      const patientDetails = await prisma.patient.findUnique({
        where: { IC: patientIC },
        select: { name: true, age: true, gender: true },
      });

      // Add patient details to the current appointment object
      appointmentsBooking[i].patientDetails = patientDetails;
    }

    console.log(appointmentsBooking);

    return res.json({ appointmentsBooking });

    // // Calculate the date 5 days from now in Malaysian time
    // const currentDate = DateTime.now().setZone("Asia/Kuala_Lumpur");
    // const fiveDaysFromNow = currentDate.plus({ days: 5 });
    // const followUpDetails = await prisma.appointment.findMany({
    //   where: {
    //     followUpDate: {
    //       // Use Prisma date functions to compare dates
    //       gt: currentDate.toJSDate(), // greater than current date
    //       lte: fiveDaysFromNow.toJSDate(), // less than or equal to 5 days from now
    //     },
    //   },
    // });
    // console.log(followUpDetails);
    // // Iterate over each appointment and fetch patient details
    // for (const appointment of followUpDetails) {
    //   const patient = await prisma.patient.findUnique({
    //     where: {
    //       IC: appointment.patientIC,
    //     },
    //     select: {
    //       name: true,
    //       contact: true,
    //     },
    //   });
    //   // Add patient details to the appointment
    //   appointment.patientName = patient?.name || "Unknown";
    //   appointment.patientContact = patient?.contact || "Unknown";
    // }
    // return res.json({ followUpDetails });
  } catch (error) {
    console.error("Error finding info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
