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
import addMedicineRouter from "./src/controllers/addMedicine.controllers.js";
import addExistingMedicineRouter from "./src/controllers/addExistingMedicine.controllers.js";

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
app.use("/add-medicine", addMedicineRouter);
app.use("/add-existing-medicine", addExistingMedicineRouter);
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

// Function to subtract medicine quantities (link to endpoint below)
const subtractMedicine = async (medicineName, quantity) => {
  try {
    // Find the medicine in the Medicine table
    const medicine = await prisma.medicine.findUnique({
      where: { medicine: medicineName },
    });

    if (!medicine) {
      console.error(`Medicine not found: ${medicineName}`);
      return false; // Indicate that medicine was not found
    }

    // Check if there is enough quantity
    if (medicine.quantity < quantity) {
      return false; // Indicate that there is not enough medicine
    }

    // Update the quantity field
    await prisma.medicine.update({
      where: { id: medicine.id },
      data: {
        quantity: Math.max(medicine.quantity - quantity, 0), // Ensure quantity is not negative
      },
    });

    return true; // Indicate successful subtraction
  } catch (error) {
    console.error("Error subtracting medicine:", error);
    return false; // Indicate failure due to an error
  }
};

// add treatment plan to appointment table and update inventory of meds according to treatment plan
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

    // Subtract medicine quantities
    const subtractedMeds1 = await subtractMedicine(data.meds1, data.quantity1);
    const subtractedMeds2 = await subtractMedicine(data.meds2, data.quantity2);

    // Check if subtraction was successful
    if (!subtractedMeds1 || !subtractedMeds2) {
      // Send a status back of 401 if there is not enough medicine
      return res
        .status(401)
        .json({ error: "Not enough medicine for the treatment plan" });
    }

    return res.status(200).json({
      treatmentPlan,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// get invoice details from appt table for nurses to prepare meds and invoice
app.get("/invoice-details/:appointmentID", async (req, res) => {
  // here first, per the appointment ID, we need to get the details of meds for that appointment. the fields we will be looking at in the appointment table is meds1, quantity1, meds2, quantity2. please note, that if any of it is "null" or 0, we dont get those details and ignore it.

  // once we get the meds and quantity in that appointment, we then need to search the medicine table. according to the meds from appointment table(meds1 and/or meds2), we need to get the associated price for those meds (need the price field for that medicine from medicine table)

  // once we get the price of that specific medicine, we then need to multiply that price to quantity of meds dispenses (either quantity 1 and/or quantity 2). this gives the total monetary aount for each meds.
  // finally we need to add the total amounts for each meds to get the total amount for that appointment
  const appointmentID = parseInt(req.params.appointmentID);
  try {
    // Step 1: Fetch the appointment details
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentID,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "No appointments found" });
    }

    // Step 2: Extract the medication details from the appointment
    const medsDetails = [
      { name: appointment.medName1, quantity: appointment.quantity1 },
      { name: appointment.medName2, quantity: appointment.quantity2 },
    ].filter((med) => med.name !== "null" && med.quantity > 0);

    // Step 3: Look up the medicine details for each medication
    const totalAmounts = await Promise.all(
      medsDetails.map(async (med) => {
        const medicine = await prisma.medicine.findUnique({
          where: {
            medicine: med.name,
          },
        });

        if (!medicine) {
          console.error(`Medicine not found: ${med.name}`);
          return 0; // Assuming a default value if medicine not found
        }

        // Step 4: Calculate the total amount for each medication
        const totalAmount = medicine.price * med.quantity;

        return totalAmount;
      })
    );

    // Step 5: Sum up the total amounts to get the overall appointment total
    const appointmentTotalAmount = totalAmounts.reduce(
      (sum, amount) => sum + amount,
      0
    );

    // Step 6: Update the 'amount' field in the appointment table
    await prisma.appointment.update({
      where: {
        id: appointmentID,
      },
      data: {
        amount: appointmentTotalAmount,
      },
    });

    // just invoice details without amount below!

    const invoiceDetails = await prisma.appointment.findMany({
      where: {
        id: appointmentID,
      },
    });

    console.log(invoiceDetails);

    if (invoiceDetails.length === 0) {
      return res.status(404).json({ error: "No appointments found" });
    }
    return res.json({ invoiceDetails });
  } catch (error) {
    console.error("Error getting appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// cash payment just been made
app.post("/click-paid/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID, 10); // Convert to integer

    // Update medicine fields the appointment table
    const statusChange = await prisma.appointment.update({
      where: { id: appointmentID },
      data: {
        status: "completed",
      },
    });

    // here we are going to get details from appoitnemtn table where id= appointmentID. we want to get the patientIC field and the amount field for this appointment.
    // Fetch details from the appointment table
    const appointmentDetails = await prisma.appointment.findUnique({
      where: { id: appointmentID },
      select: {
        patientIC: true,
        amount: true,
      },
    });

    if (!appointmentDetails) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Add details to the cashRevenue table
    const cashRevenueEntry = await prisma.cashRevenue.create({
      data: {
        appId: { connect: { id: appointmentID } },
        patic: { connect: { IC: appointmentDetails.patientIC } },
        amount: appointmentDetails.amount,
      },
    });

    return res.status(200).json({
      statusChange,
      cashRevenueEntry,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
