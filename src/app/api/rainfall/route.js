import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  processRainfallData,
  filterMonsoonMonths,
} from "@/utils/rainfallDataProcessor";

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
      // Try to use the data from JSON files instead
      return getDataFromJson(monsoonOnly);
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

    // Try to use the data from JSON files as fallback
    return getDataFromJson(monsoonOnly);
  }
}

/**
 * Fallback function to get data from JSON files if CSV processing fails
 */
async function getDataFromJson(monsoonOnly) {
  try {
    // Determine which JSON file to use
    const jsonFileName = monsoonOnly
      ? "fig_2_comic_neue_index_by_year_color_bars.json"
      : "fig_1_comic_neue_index_by_year_color_bars.json";

    const jsonPath = path.join(process.cwd(), "data", "results", jsonFileName);

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { success: false, error: "Data files not found" },
        { status: 404 },
      );
    }

    // Read and parse the JSON file
    const jsonContent = fs.readFileSync(jsonPath, "utf8");
    const plotlyData = JSON.parse(jsonContent);

    // Extract data from Plotly format
    const yearlyData = {};
    let minValue = Infinity;
    let maxValue = -Infinity;

    // Extract data from layout annotations to get years
    const years = plotlyData.layout.annotations
      .map((anno) => {
        const match = anno.text?.match(/Year (\d{4})/);
        return match ? match[1] : null;
      })
      .filter((year) => year !== null);

    // Extract data from traces
    plotlyData.data.forEach((trace, i) => {
      if (!trace.x || !trace.y) return;

      const year = years[Math.floor(i / 5)]; // Assuming 5 traces per year
      if (!year) return;

      if (!yearlyData[year]) {
        yearlyData[year] = [];
      }

      // Extract month and value pairs
      for (let j = 0; j < trace.x.length; j++) {
        const month = trace.x[j];
        const value = trace.y[j];

        yearlyData[year].push({
          Year: parseInt(year),
          Month: parseInt(month),
          "Index Value": value,
        });

        // Update min/max
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });

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
    console.error("Error processing JSON fallback:", error);

    return NextResponse.json(
      { success: false, error: "Failed to process rainfall data" },
      { status: 500 },
    );
  }
}
