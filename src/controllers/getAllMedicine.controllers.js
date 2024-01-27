import express from "express";
import prisma from "../utils/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const allMeds = await prisma.medicine.findMany();

  return res.json({ allMeds });
});

export default router;
