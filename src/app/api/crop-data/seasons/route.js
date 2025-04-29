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

// GET handler to fetch seasons for a specific crop
export async function GET(request) {
  try {
    // Get crop parameter from the URL
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");

    if (!crop) {
      return NextResponse.json(
        { error: "Crop parameter is required" },
        { status: 400 },
      );
    }

    const data = await readCropData();
    const seasons = [
      ...new Set(
        data
          .filter((row) => row.CROP === crop)
          .map((row) => row.SEASON)
          .filter(Boolean),
      ),
    ];

    return NextResponse.json(seasons.sort());
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { error: "Failed to fetch seasons" },
      { status: 500 },
    );
  }
}
