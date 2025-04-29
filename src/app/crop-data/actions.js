// src/app/crop-data/actions.js
"use server";

import { parse } from "papaparse";

// Helper function to read and parse the CSV file
async function readCropData() {
  const response = await fetch(
    new URL(
      "/sovon_data_final.csv",
      process.env.VERCEL_URL || "http://localhost:3000",
    ),
  );
  const fileContent = await response.text();

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
  const filteredData = data.find(
    (row) => row.CROP === crop && row.SEASON === season && row.STATE === state,
  );
  return filteredData;
}
