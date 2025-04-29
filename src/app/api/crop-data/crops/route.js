// src/app/api/crop-data/route.js

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "papaparse";

// Helper function to read and parse the CSV file
async function readCropData() {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "sovon_data_final.csv",
  );
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { data } = parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  return data;
}

// GET handler to fetch all unique crops
export async function GET() {
  try {
    const data = await readCropData();
    const uniqueCrops = [
      ...new Set(data.map((row) => row.CROP).filter(Boolean)),
    ];

    return NextResponse.json(uniqueCrops.sort());
  } catch (error) {
    console.error("Error fetching crops:", error);
    return NextResponse.json(
      { error: "Failed to fetch crops" },
      { status: 500 },
    );
  }
}
