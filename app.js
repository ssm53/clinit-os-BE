import express from "express";
import prisma from "./src/utils/prisma.js";
import morgan from "morgan";
import cors from "cors"; // Import the cors middleware
import { DateTime } from "luxon"; // Import luxon library
import usersRouter from "./src/controllers/users.controllers.js";
import authUserRouter from "./src/controllers/authUser.controllers.js";
import registerPatientsRouter from "./src/controllers/registerPatients.controllers.js";
import allPatientsRouter from "./src/controllers/allPatients.controllers.js";
import setAppointmentRouter from "./src/controllers/setAppointment.controllers.js";
import appointmentTodayRouter from "./src/controllers/appointmentToday.controllers.js";
import appointmentWaitingRouter from "./src/controllers/appointmentWaiting.controllers.js";
import appointmentDispensaryRouter from "./src/controllers/appointmentDispensary.controllers.js";

const app = express();
app.use(morgan("combined"));
app.use(cors()); // Use the cors middleware to allow cross-origin requests
app.use(express.json()); // Add this middleware to parse JSON in request bodies
app.use("/users", usersRouter);
app.use("/auth-user", authUserRouter);
app.use("/register-patient", registerPatientsRouter);
app.use("/all-patients", allPatientsRouter);
app.use("/set-appointment", setAppointmentRouter);
app.use("/appointment-today", appointmentTodayRouter);
app.use("/appointment-waiting", appointmentWaitingRouter);
app.use("/appointment-dispensary", appointmentDispensaryRouter);
//START OF ENDPOINTS

// filter patients end point
app.get("/filtered-patients/:patientIC", async (req, res) => {
  const patientIC = req.params.patientIC;
  try {
    const filteredPatients = await prisma.patient.findMany({
      where: {
        IC: patientIC,
      },
    });

    if (filteredPatients.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found with the specified IC" });
    }

    return res.json({ filteredPatients });
  } catch (error) {
    console.error("Error filtering patients:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// get part patient info for consulattion page
app.get("/part-patient-info/:patientIC", async (req, res) => {
  const patientIC = req.params.patientIC;
  try {
    const partPatientInfo = await prisma.patient.findMany({
      where: {
        IC: patientIC,
      },
    });

    if (partPatientInfo.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found with the specified IC" });
    }

    return res.json({ partPatientInfo });
  } catch (error) {
    console.error("Error filtering patients:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// adding notes to appointment table
app.post("/add-notes/:appointmentID", async (req, res) => {
  try {
    const data = req.body;
    const appointmentID = req.params.appointmentID;

    // Use Prisma to update the notes field for the specified appointment ID
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: parseInt(appointmentID), // Assuming id is of type Int
      },
      data: {
        notes: data.notes,
      },
    });

    return res.status(200).json({ updatedAppointment });
  } catch (error) {
    console.error("Error adding notes:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// getting patient history
app.get("/get-patient-history/:patientIC", async (req, res) => {
  const patientIC = req.params.patientIC;
  try {
    const patientHistory = await prisma.appointment.findMany({
      where: {
        patientIC: patientIC,
      },
    });

    console.log(patientHistory);

    if (patientHistory.length === 0) {
      return res.status(404).json({ error: "No prior appointments found" });
    }

    return res.json({ patientHistory });
  } catch (error) {
    console.error("Error filtering patients:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// consultation started - update consultstarttime and calculate waitingtime
app.post("/start-consultation/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID, 10); // Convert to integer

    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
    console.log("Current time in Malaysia:", malaysiaTime.toISO());

    // Update consult_start_time field in the appointment table
    const consultStartTime = await prisma.appointment.update({
      where: { id: appointmentID },
      data: { consultStartTime: malaysiaTime },
    });

    // calc for waiting time
    // // Calculate waiting time (current time in Malaysia - arrivalTime)
    // const appointment = await prisma.appointment.findUnique({
    //   where: { id: appointmentID },
    // });

    // const arrivalTime = DateTime.fromISO(appointment.arrivalTime);
    // const waitingTime = malaysiaTime.diff(arrivalTime);

    // // Update waitingTime field in the appointment table
    // await prisma.appointment.update({
    //   where: { id: appointmentID },
    //   data: { waitingTime: waitingTime.toISO() }, // Convert DateTime to ISO string
    // });

    // Update status field to "serving"
    const changeStatus = await prisma.appointment.update({
      where: { id: appointmentID },
      data: { status: "serving" },
    });

    return res.status(200).json({
      consultStartTime,
      changeStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// consultation ended - update consultendttime and calculate consultation time
app.post("/end-consultation/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID, 10); // Convert to integer

    const malaysiaTime = DateTime.local().setZone("Asia/Kuala_Lumpur");
    console.log("Current time in Malaysia:", malaysiaTime.toISO());

    // Update consult_end_time field in the appointment table
    const consultEndTime = await prisma.appointment.update({
      where: { id: appointmentID },
      data: { consultEndTime: malaysiaTime },
    });

    // Update status field to "dispensary"
    const changeStatus = await prisma.appointment.update({
      where: { id: appointmentID },
      data: { status: "dispensary" },
    });

    return res.status(200).json({
      consultEndTime,
      changeStatus,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// add treatment plan to appointment table
app.post("/add-treatment-plan/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID, 10); // Convert to integer
    const data = req.body;

    // Update medicine fields the appointment table
    const treatmentPlan = await prisma.appointment.update({
      where: { id: appointmentID },
      data: {
        medName1: data.meds1,
        quantity1: data.quantity1,
        notes1: data.notes1,
        medName2: data.meds2,
        quantity2: data.quantity2,
        notes2: data.notes2,
      },
    });

    return res.status(200).json({
      treatmentPlan,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
