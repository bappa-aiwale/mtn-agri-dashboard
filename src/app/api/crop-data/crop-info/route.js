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

// GET handler to fetch complete crop information for selected filters
export async function GET(request) {
  try {
    // Get crop, season, and state parameters from the URL
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get("crop");
    const season = searchParams.get("season");
    const state = searchParams.get("state");

    if (!crop || !season || !state) {
      return NextResponse.json(
        { error: "Crop, season, and state parameters are all required" },
        { status: 400 },
      );
    }

    const data = await readCropData();
    const cropInfo = data.find(
      (row) =>
        row.CROP === crop && row.SEASON === season && row.STATE === state,
    );

    if (!cropInfo) {
      return NextResponse.json(
        { error: "No data found for the specified combination" },
        { status: 404 },
      );
    }

    return NextResponse.json(cropInfo);
  } catch (error) {
    console.error("Error fetching crop info:", error);
    return NextResponse.json(
      { error: "Failed to fetch crop information" },
      { status: 500 },
    );
  }
}
