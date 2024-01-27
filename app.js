import express from "express";
import prisma from "./src/utils/prisma.js";
import morgan from "morgan";
import cors from "cors"; // Import the cors middleware
import { DateTime } from "luxon"; // Import luxon library
import fs from "fs"; // generating PDF
import PDFDocument from "./pdfkit-tables.js"; // generating PDF
import usersRouter from "./src/controllers/users.controllers.js";
import authUserRouter from "./src/controllers/authUser.controllers.js";
import registerPatientsRouter from "./src/controllers/registerPatients.controllers.js";
import allPatientsRouter from "./src/controllers/allPatients.controllers.js";
import newPatientAppointmentRouter from "./src/controllers/newPatientAppointment.controllers.js";
import newPatientAppointmentBookingRouter from "./src/controllers/newPatientAppointmentBooking.controllers.js";
import appointmentBookingTodayRouter from "./src/controllers/appointmentBookingToday.controllers.js";
import appointmentWaitingRouter from "./src/controllers/appointmentWaiting.controllers.js";
import appointmentDispensaryRouter from "./src/controllers/appointmentDispensary.controllers.js";
import addMedicineRouter from "./src/controllers/addMedicine.controllers.js";
import addExistingMedicineRouter from "./src/controllers/addExistingMedicine.controllers.js";
import appointmentAllRouter from "./src/controllers/appointmentAll.controllers.js";
import getNeedRestockMeds from "./src/controllers/getNeedRestockMedicine.controllers.js";
import getFollowUpDetailsRouter from "./src/controllers/getFollowUpDetails.controllers.js";
import existingPatientAppointmentRouter from "./src/controllers/existingPatientAppointment.constrollers.js";
import existingPatientAppointmentBookingRouter from "./src/controllers/existingPatientAppointmentBooking.controllers.js";
import queueRouter from "./src/controllers/queue.controllers.js";
import appointmentCompletedRouter from "./src/controllers/appointmentCompleted.controllers.js";
import getAllMedicineRouter from "./src/controllers/getAllMedicine.controllers.js";
import { validateEditPatientDetails } from "./src/validators/validateEditPatientDetails.js";

const app = express();
app.use(morgan("combined"));
app.use(cors()); // Use the cors middleware to allow cross-origin requests
app.use(express.json()); // Add this middleware to parse JSON in request bodies
app.use("/users", usersRouter);
app.use("/auth-user", authUserRouter);
app.use("/register-patient", registerPatientsRouter);
app.use("/all-patients", allPatientsRouter);
app.use("/new-patient-appointment", newPatientAppointmentRouter);
app.use("/appointment-booking-today", appointmentBookingTodayRouter);
app.use("/appointment-waiting", appointmentWaitingRouter);
app.use("/appointment-dispensary", appointmentDispensaryRouter);
app.use("/add-medicine", addMedicineRouter);
app.use("/add-existing-medicine", addExistingMedicineRouter);
app.use("/appointment-all", appointmentAllRouter);
app.use("/get-need-restock-medicine", getNeedRestockMeds);
app.use("/get-follow-up-details", getFollowUpDetailsRouter);
app.use("/existing-patient-appointment", existingPatientAppointmentRouter);
app.use(
  "/existing-patient-appointment-booking",
  existingPatientAppointmentBookingRouter
);
app.use("/new-patient-appointment-booking", newPatientAppointmentBookingRouter);
app.use("/queue", queueRouter);
app.use("/appointment-completed", appointmentCompletedRouter);
app.use("/get-all-medicine", getAllMedicineRouter);

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

// // add treatment plan to appointment table and update inventory of meds according to treatment plan
// app.post("/add-treatment-plan/:appointmentID", async (req, res) => {
//   try {
//     const appointmentID = parseInt(req.params.appointmentID, 10); // Convert to integer
//     const data = req.body;

//     // Update medicine fields the appointment table
//     const treatmentPlan = await prisma.appointment.update({
//       where: { id: appointmentID },
//       data: {
//         medName1: data.meds1,
//         quantity1: data.quantity1,
//         notes1: data.notes1,
//         medName2: data.meds2,
//         quantity2: data.quantity2,
//         notes2: data.notes2,
//       },
//     });

//     // Subtract medicine quantities
//     const subtractedMeds1 = await subtractMedicine(data.meds1, data.quantity1);
//     const subtractedMeds2 = await subtractMedicine(data.meds2, data.quantity2);

//     // Check if subtraction was successful
//     if (!subtractedMeds1 || !subtractedMeds2) {
//       // Send a status back of 401 if there is not enough medicine
//       return res
//         .status(401)
//         .json({ error: "Not enough medicine for the treatment plan" });
//     }

//     return res.status(200).json({
//       treatmentPlan,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/add-treatment-plan/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID, 10);
    const data = req.body;

    // Initialize an object to hold the treatment plan data
    const treatmentPlanData = {};

    // Iterate over the array of medicines and update the treatment plan data
    data.forEach((medicine, index) => {
      treatmentPlanData[`medName${index + 1}`] = medicine.meds;
      treatmentPlanData[`quantity${index + 1}`] = medicine.quantity;
      treatmentPlanData[`notes${index + 1}`] = medicine.notes;
    });

    // Update medicine fields in the appointment table
    const treatmentPlan = await prisma.appointment.update({
      where: { id: appointmentID },
      data: treatmentPlanData,
    });

    // Subtract medicine quantities
    for (const medicine of data) {
      const subtractedMeds = await subtractMedicine(
        medicine.meds,
        medicine.quantity
      );

      // Check if subtraction was successful
      if (!subtractedMeds) {
        return res
          .status(401)
          .json({ error: "Not enough medicine for the treatment plan" });
      }
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

    // START OF GENERATION OF PDF
    // Create The PDF document
    const doc = new PDFDocument();

    // Pipe the PDF into a patient's file
    doc.pipe(fs.createWriteStream(`${appointmentID}.pdf`));

    // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
    doc
      .image("logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text(`Invoice ${appointmentID}`, 110, 57)
      .fontSize(10)
      .text("25, Jalan 4/39", 200, 65, { align: "right" })
      .text("Petaling Jaya, Malaysia", 200, 80, { align: "right" })
      .moveDown();

    // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
    const table = {
      // ic, reason, date, doctor, meds (we do all of it in here), amount
      headers: [
        "IC",
        "Reason",
        "Date",
        "Doctor",
        "Medicine 1",
        "Quantity 1",
        "Medicine 1",
        "Quantity 2",
        "Amount",
        // "Height",
        // "Weight",
      ],
      rows: [],
    };

    // Add the patients to the table
    for (const details of invoiceDetails) {
      table.rows.push([
        details.patientIC,
        details.reason,
        details.date,
        details.doctor,
        details.medName1,
        details.quantity1,
        details.medName2,
        details.quantity2,
        details.amount,
      ]);
    }

    // Draw the table
    doc.moveDown().table(table, 10, 125, { width: 590 });

    // Finalize the PDF and end the stream
    doc.end();

    // END OF PDF GENERATION

    // Pipe the PDF directly to the response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${appointmentID}.pdf`
    );

    doc.pipe(res);

    // if (invoiceDetails.length === 0) {
    //   return res.status(404).json({ error: "No appointments found" });
    // }
    // return res.json({ invoiceDetails });
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

// a get request to get specific patient details
app.get("/get-patient-details/:ic", async (req, res) => {
  const ic = req.params.ic;

  try {
    const patientDetails = await prisma.patient.findUnique({
      where: { IC: ic },
    });

    if (!patientDetails) {
      return res.status(404).json({ error: "Patient not found" });
    }

    return res.json({ patientDetails });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// here i want to do an endpoint to update patiend details
app.patch("/update-patient-details/:ic", async (req, res) => {
  const ic = req.params.ic;
  const data = req.body; // Assuming your request body contains the updated data

  const validationErrors = validateEditPatientDetails(data);
  console.log(validationErrors);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  try {
    // Use Prisma to update the seller's details
    const updatedDetails = await prisma.patient.update({
      where: {
        IC: ic,
      },
      // name, IC, age, gender, email, contact, race
      data: {
        name: data.name,
        IC: data.IC,
        age: data.age,
        gender: data.gender,
        email: data.email,
        contact: data.contact,
        race: data.race,
      },
    });

    // Return a success response
    return res
      .status(200)
      .json({ message: "Seller details updated successfully", updatedDetails });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error updating details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get part patient info for consulattion page
app.get("/get-patient-info/:ic", async (req, res) => {
  const patientIC = req.params.ic;
  try {
    const patientInfo = await prisma.patient.findMany({
      where: {
        IC: patientIC,
      },
    });

    if (patientInfo.length === 0) {
      return res
        .status(404)
        .json({ error: "No patients found with the specified IC" });
    }

    return res.json({ patientInfo });
  } catch (error) {
    console.error("Error filtering patients:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// get part patient info for consulattion page
app.get("/get-appt-info/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const apptInfo = await prisma.appointment.findMany({
      where: {
        id: id,
      },
    });

    if (apptInfo.length === 0) {
      return res
        .status(404)
        .json({ error: "No appts found with the specified id" });
    }
    console.log(apptInfo);

    return res.json({ apptInfo });
  } catch (error) {
    console.error("Error finding info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// here i want to do an endpoint to update appt details
app.patch("/edit-notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body; // Assuming your request body contains the updated data

  try {
    // Use Prisma to update the seller's details
    const updatedNotes = await prisma.appointment.update({
      where: {
        id: id,
      },
      // name, IC, age, gender, email, contact, race
      data: {
        notes: data.notes,
      },
    });

    // Return a success response
    return res
      .status(200)
      .json({ message: "notes details updated successfully", updatedNotes });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error updating details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// here i want to do an endpoint to update appt details
app.patch("/edit-treatment-plan/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body; // Assuming your request body contains the updated data

  try {
    // Use Prisma to update the seller's details
    const updatedTreatmentPlan = await prisma.appointment.update({
      where: {
        id: id,
      },
      // name, IC, age, gender, email, contact, race
      data: {
        medName1: data.meds1,
        quantity1: data.quantity1,
        notes1: data.notes1,
        medName2: data.meds2,
        quantity2: data.quantity2,
        notes2: data.notes2,
      },
    });

    // Return a success response
    return res.status(200).json({
      message: "notes details updated successfully",
      updatedTreatmentPlan,
    });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error updating details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete medicine endpoint
app.delete("/delete-medicine/:medicineID", async (req, res) => {
  try {
    const medicineToDel = parseInt(req.params.medicineID);

    await prisma.medicine.delete({
      where: {
        id: medicineToDel,
      },
    });

    return res.status(204).send(); // Successful deletion (status 204)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// // here aim is to update the appointment field with followUpReason and followUpDate
// app.patch("/add-follow-up/:appointmentID", async (req, res) => {
//   const id = parseInt(req.params.appointmentID);
//   const data = req.body; // Assuming your request body contains the updated data

//   try {
//     // Use Prisma to update the seller's details
//     const addFollowUp = await prisma.appointment.update({
//       where: {
//         id: id,
//       },
//       // name, IC, age, gender, email, contact, race
//       data: {
//         followUpReason: data.followUpReason,
//         followUpDate: data.followUpDate,
//       },
//     });

//     // Return a success response
//     return res
//       .status(200)
//       .json({ message: "Follow up deets updated successfully", addFollowUp });
//   } catch (error) {
//     // Handle errors and return an error response if needed
//     console.error("Error adding follow up:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.post("/add-follow-up/:appointmentID", async (req, res) => {
  const id = parseInt(req.params.appointmentID);
  const data = req.body; // Assuming your request body contains the updated data

  try {
    // Use Prisma to get details from this appt where id in the appointment table = id. from that appt table, i specifically
    // want to get only the patientIC field.

    // then once that is done I want to create a new appointment, and add these details in there where ic: patientIC we got from above, reason: data.followUpReason, date: followUpDate

    // Use Prisma to get details from the existing appointment where id in the appointment table = id.
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { patientIC: true, date: true }, // Select only necessary fields
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Create a new follow-up appointment
    const followUpAppointment = await prisma.appointment.create({
      data: {
        specificpatient: { connect: { IC: existingAppointment.patientIC } },
        reason: data.followUpReason,
        date: DateTime.fromISO(data.followUpDate).toJSDate(),
        status: "Booking",
      },
    });

    return res.status(200).json({
      message: "Follow-up appointment created successfully",
      followUpAppointment,
    });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error adding follow up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// add mc details to be generated later
app.post("/add-mc-details/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID); // Convert to integer
    const data = req.body;

    // Update the existing appointment with MC details
    const mcDetails = await prisma.appointment.update({
      where: {
        id: appointmentID,
      },
      data: {
        mcReason: data.reason,
        employer: data.employer,
        mcStart: data.mcStartDate,
        mcEnd: data.mcEndDate,
      },
    });
    return res.status(200).json({
      mcDetails,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Cant add MC details" });
  }
});

// get mc details from appt table for nurses to generate
app.get("/mc-details/:appointmentID", async (req, res) => {
  const appointmentID = parseInt(req.params.appointmentID);
  try {
    let mcDetails = await prisma.appointment.findMany({
      where: { id: appointmentID },
    });

    // START OF GENERATION OF PDF
    // Create The PDF document
    const doc = new PDFDocument();

    // Pipe the PDF into a patient's file
    doc.pipe(fs.createWriteStream(`${appointmentID}.pdf`));

    // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
    doc
      .image("logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text(`MC ${appointmentID}`, 110, 57)
      .fontSize(10)
      .text("25, Jalan 4/39", 200, 65, { align: "right" })
      .text("Petaling Jaya, Malaysia", 200, 80, { align: "right" })
      .moveDown();

    // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
    const table = {
      headers: ["IC", "Reason", "Start Date", "End Date", "Employer"],
      rows: [],
    };

    // Add the mcDetails to the table
    for (const details of mcDetails) {
      table.rows.push([
        details.patientIC,
        details.mcReason,
        details.mcStart,
        details.mcEnd,
        details.employer,
      ]);
    }

    // Draw the table
    doc.moveDown().table(table, 10, 125, { width: 590 });

    // Finalize the PDF and end the stream
    doc.end();

    // END OF PDF GENERATION

    // Pipe the PDF directly to the response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MC_${appointmentID}.pdf`
    );

    doc.pipe(res);
  } catch (error) {
    console.error("Error getting appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// add letter details to be generated later
app.post("/add-letter-details/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID); // Convert to integer
    const data = req.body;

    // Update the existing appointment with letter details
    const letterDetails = await prisma.appointment.update({
      where: {
        id: appointmentID,
      },
      data: {
        letterDate: data.letterDate,
        letterContent: data.content,
      },
    });
    return res.status(200).json({
      letterDetails,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Cant add MC details" });
  }
});

// get letter details from appt table for nurses to generate
app.get("/letter-details/:appointmentID", async (req, res) => {
  const appointmentID = parseInt(req.params.appointmentID);
  try {
    let letterDetails = await prisma.appointment.findMany({
      where: { id: appointmentID },
    });

    // START OF GENERATION OF PDF
    // Create The PDF document
    const doc = new PDFDocument();

    // Pipe the PDF into a patient's file
    doc.pipe(fs.createWriteStream(`${appointmentID}.pdf`));

    // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
    doc
      .image("logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text(`Referral Letter ${appointmentID}`, 110, 57)
      .fontSize(10)
      .text("25, Jalan 4/39", 200, 65, { align: "right" })
      .text("Petaling Jaya, Malaysia", 200, 80, { align: "right" })
      .moveDown();

    // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
    const table = {
      headers: ["IC", "Date", "Letter"],
      rows: [],
    };

    // Add the mcDetails to the table
    for (const details of letterDetails) {
      table.rows.push([
        details.patientIC,
        details.letterDate,
        details.letterContent,
      ]);
    }

    // Draw the table
    doc.moveDown().table(table, 10, 125, { width: 590 });

    // Finalize the PDF and end the stream
    doc.end();

    // END OF PDF GENERATION

    // Pipe the PDF directly to the response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Referral_Letter_${appointmentID}.pdf`
    );

    doc.pipe(res);
  } catch (error) {
    console.error("Error doing letter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// change appointment from Booking to Waiting
app.post("/click-arrived/:appointmentID", async (req, res) => {
  try {
    const appointmentID = parseInt(req.params.appointmentID); // Convert to integer
    console.log(appointmentID);

    // Update the existing appointment with letter details
    const bookingToWaiting = await prisma.appointment.update({
      where: {
        id: appointmentID,
      },
      data: {
        status: "Waiting",
      },
    });
    return res.status(200).json({
      bookingToWaiting,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Cant change status" });
  }
});

// here i want to do an endpoint to update patiend details
app.patch("/edit-completed-appointment/:ID", async (req, res) => {
  const ID = parseInt(req.params.ID);
  const data = req.body; // Assuming your request body contains the updated data

  // const validationErrors = validateEditPatientDetails(data);
  // console.log(validationErrors);

  // if (Object.keys(validationErrors).length != 0)
  //   return res.status(400).send({
  //     error: validationErrors,
  //   });

  try {
    // Use Prisma to update the seller's details
    const updatedAppt = await prisma.appointment.update({
      where: {
        id: ID,
      },

      data: {
        reason: data.reason,
        doctor: data.doctor,
        notes: data.notes,
        documents: data.documents,
        medName1: data.medName1,
        medName2: data.medName2,
        quantity1: data.quantity1,
        quantity2: data.quantity2,
        notes1: data.notes1,
        notes2: data.notes2,
        amount: data.amount,
      },
    });

    // Return a success response
    return res
      .status(200)
      .json({ message: "Appointment updated successfully", updatedAppt });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error updating details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// edit medicine (not restock)
app.patch("/edit-medicine/:medicineID", async (req, res) => {
  const ID = parseInt(req.params.medicineID);
  const data = req.body; // Assuming your request body contains the updated data

  try {
    // Use Prisma to update the seller's details
    const updatedMeds = await prisma.medicine.update({
      where: {
        id: medicineID,
      },

      data: {
        medicine: data.medicine,
        quantity: data.quantity,
        price: data.price,
      },
    });

    // Return a success response
    return res
      .status(200)
      .json({ message: "Meds updated successfully", updatedMeds });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error updating details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
