import express from "express";
import prisma from "./src/utils/prisma.js";
import morgan from "morgan";
import cors from "cors"; // Import the cors middleware
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
    console.log(partPatientInfo);

    return res.json({ partPatientInfo });
  } catch (error) {
    console.error("Error filtering patients:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
