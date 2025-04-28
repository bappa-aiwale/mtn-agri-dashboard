"use client";
import { useState, useEffect } from "react";
import {
  getAllCrops,
  getSeasonsForCrop,
  getStatesForCropAndSeason,
  getCropInfo,
} from "./actions";

function CropDate() {
  // State for available options
  const [crops, setCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [states, setStates] = useState([]);

  // State for selected values
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // State for the selected crop data
  const [cropData, setCropData] = useState(null);

  // Fetch all crops on component mount
  useEffect(() => {
    async function fetchCrops() {
      const cropsList = await getAllCrops();
      setCrops(cropsList);
    }
    fetchCrops();
  }, []);

  // Update seasons when crop changes
  useEffect(() => {
    async function fetchSeasons() {
      if (selectedCrop) {
        const seasonsList = await getSeasonsForCrop(selectedCrop);
        setSeasons(seasonsList);
        // Reset season and state selections
        setSelectedSeason("");
        setSelectedState("");
        setStates([]);
      }
    }
    fetchSeasons();
  }, [selectedCrop]);

  // Update states when season changes
  useEffect(() => {
    async function fetchStates() {
      if (selectedCrop && selectedSeason) {
        const statesList = await getStatesForCropAndSeason(
          selectedCrop,
          selectedSeason,
        );
        setStates(statesList);
        // Reset state selection
        setSelectedState("");
      }
    }
    fetchStates();
  }, [selectedCrop, selectedSeason]);

  // Fetch crop data when all selections are made
  useEffect(() => {
    async function fetchCropData() {
      if (selectedCrop && selectedSeason && selectedState) {
        const data = await getCropInfo(
          selectedCrop,
          selectedSeason,
          selectedState,
        );
        setCropData(data);
      }
    }
    fetchCropData();
  }, [selectedCrop, selectedSeason, selectedState]);

  return (
    <div className="container mx-auto p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-mtn-green-800">
        Crop Calendar Selector
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Crop Selector */}
        <div>
          <label className="block font-bold text-mtn-green-800 mb-2">
            Select Crop
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full p-2 border border-mtn-green-700 rounded-md shadow-sm text-mtn-green-800"
          >
            <option value="">-- Select Crop --</option>
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        {/* Season Selector */}
        <div>
          <label className="block font-bold text-mtn-green-800 mb-2">
            Select Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full p-2 border border-mtn-green-700 rounded-md shadow-sm text-mtn-green-800"
            disabled={!selectedCrop}
          >
            <option value="">-- Select Season --</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        {/* State Selector */}
        <div>
          <label className="block font-bold text-mtn-green-800 mb-2">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-2 border border-mtn-green-700 rounded-md shadow-sm text-mtn-green-800"
            disabled={!selectedSeason}
          >
            <option value="">-- Select State --</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display selected data */}
      {cropData && (
        <div className="mt-16 bg-white rounded-lg text-mtn-green-800">
          <h2 className="text-2xl font-semibold mb-4">
            Selected Crop Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <span className="font-medium">Crop:</span> {cropData.CROP}
            </div>
            <div>
              <span className="font-medium">Season:</span> {cropData.SEASON}
            </div>
            <div>
              <span className="font-medium">State:</span> {cropData.STATE}
            </div>
          </div>

          <h3 className="text-lg font-medium mb-2">Monthly Calendar</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              "JAN",
              "FEB",
              "MAR",
              "APR",
              "MAY",
              "JUN",
              "JUL",
              "AUG",
              "SEP",
              "OCT",
              "NOV",
              "DEC",
            ].map((month) => (
              <div key={month} className="p-2 border rounded">
                <div className="text-sm font-medium">{month}</div>
                <div>{cropData[month] || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CropDate;
