import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  processRainfallData,
  filterMonsoonMonths,
} from "@/utils/rainfallDataProcessor";

// Tell Next.js this is a dynamic route
export const dynamic = "force-dynamic";

/**
 * GET handler for rainfall data
 */
export async function GET(request) {
  try {
    // Get monsoon parameter from request
    const { searchParams } = new URL(request.url);
    const monsoonOnly = searchParams.get("monsoon") === "true";

    // Read the CSV file
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "complete_data_INDIAN_RAIN_INDEX_Historical_Data.csv",
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "Data file not found" },
        { status: 404 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse CSV
    const rows = fileContent.split("\n");
    const headers = rows[0].split(",");

    const data = rows
      .slice(1)
      .filter((row) => row.trim())
      .map((row) => {
        const values = row.split(",");
        const record = {};

        headers.forEach((header, index) => {
          record[header] = values[index];
        });

        return record;
      });

    // Process data
    const processedData = processRainfallData(data);

    // Filter for monsoon months if requested
    const monthlyData = monsoonOnly
      ? filterMonsoonMonths(processedData.monthlyData)
      : processedData.monthlyData;

    // Group by year for easy consumption by charts
    const yearlyData = {};
    monthlyData.forEach((item) => {
      if (!yearlyData[item.Year]) {
        yearlyData[item.Year] = [];
      }
      yearlyData[item.Year].push(item);
    });

    // Calculate min/max values for color scaling
    const allValues = monthlyData.map((item) => item["Index Value"]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    // Return data
    return NextResponse.json({
      success: true,
      data: {
        yearlyData,
        minValue,
        maxValue,
        isMonsoonOnly: monsoonOnly,
      },
    });
  } catch (error) {
    console.error("Error processing rainfall data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process rainfall data" },
      { status: 500 },
    );
  }
}
