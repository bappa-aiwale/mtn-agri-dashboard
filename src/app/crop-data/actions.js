// src/app/crop-data/actions.js
"use server";

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

// Get all unique crops
export async function getAllCrops() {
  const data = await readCropData();
  const uniqueCrops = [...new Set(data.map((row) => row.CROP).filter(Boolean))];
  return uniqueCrops.sort();
}

// Get seasons available for a specific crop
export async function getSeasonsForCrop(crop) {
  const data = await readCropData();
  const seasons = [
    ...new Set(
      data
        .filter((row) => row.CROP === crop)
        .map((row) => row.SEASON)
        .filter(Boolean),
    ),
  ];
  return seasons.sort();
}

// Get states available for a specific crop and season
export async function getStatesForCropAndSeason(crop, season) {
  const data = await readCropData();
  const states = [
    ...new Set(
      data
        .filter((row) => row.CROP === crop && row.SEASON === season)
        .map((row) => row.STATE)
        .filter(Boolean),
    ),
  ];
  return states.sort();
}

// Get complete crop information for selected filters
export async function getCropInfo(crop, season, state) {
  const data = await readCropData();
  const filtered_data = data.find(
    (row) => row.CROP === crop && row.SEASON === season && row.STATE === state,
  );
  console.log(filtered_data);
  return filtered_data;
}
