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

// GET handler to fetch states for a specific crop and season
export async function GET(request) {
  try {
    // Get crop and season parameters from the URL
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");
    const season = searchParams.get("season");

    if (!crop || !season) {
      return NextResponse.json(
        { error: "Both crop and season parameters are required" },
        { status: 400 },
      );
    }

    const data = await readCropData();
    const states = [
      ...new Set(
        data
          .filter((row) => row.CROP === crop && row.SEASON === season)
          .map((row) => row.STATE)
          .filter(Boolean),
      ),
    ];

    return NextResponse.json(states.sort());
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 },
    );
  }
}
