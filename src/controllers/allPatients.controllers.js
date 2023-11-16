import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const allPatients = await prisma.patient.findMany();

  return res.json({ allPatients });
});

export default router;
