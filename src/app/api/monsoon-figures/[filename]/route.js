//src/app/api/monsoon-figures/[filename]/route.js
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Define a mapping of simple param names to actual filenames
const filenameMapping = {
  fig1: "fig_1_comic_neue_index_by_year_color_bars.json",
  fig2: "fig_2_comic_neue_index_by_year_color_bars.json",
  fig3: "fig_3_xgboost_forecast_2024_evaluation_comic_neue.json",
  fig4: "fig_4_xgboost_monsoon_forecast_2024_evaluation_comic_neue.json",
  fig55: "fig_55_2025_actual_vs_forecast_comic_neue.json",
  fig5: "fig_5_2025_daily_forecast_comic_neue.json",
  fig6: "fig_6_2025_monthly_forecast_comic_neue.json",
};

export async function GET(request, { params }) {
  const { filename } = params;

  try {
    // Get the actual filename from the mapping
    const actualFilename = filenameMapping[filename];

    if (!actualFilename) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Construct the path to the JSON file
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "results",
      actualFilename,
    );

    // Read the JSON file
    const fileContents = await fs.readFile(filePath, "utf8");

    // Parse and return the JSON data
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return NextResponse.json(
      { error: "Failed to load data", details: error.message },
      { status: 500 },
    );
  }
}
