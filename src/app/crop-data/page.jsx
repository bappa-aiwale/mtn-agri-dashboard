"use client";
import { useState, useEffect } from "react";

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

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all crops on component mount
  useEffect(() => {
    async function fetchCrops() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/crop-data/crops");

        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }

        const cropsList = await response.json();
        setCrops(cropsList);
      } catch (err) {
        setError(`Error fetching crops: ${err.message}`);
        console.error("Error fetching crops:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCrops();
  }, []);

  // Update seasons when crop changes
  useEffect(() => {
    async function fetchSeasons() {
      if (selectedCrop) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/crop-data/seasons?crop=${encodeURIComponent(selectedCrop)}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch seasons");
          }

          const seasonsList = await response.json();
          setSeasons(seasonsList);
          // Reset season and state selections
          setSelectedSeason("");
          setSelectedState("");
          setStates([]);
        } catch (err) {
          setError(`Error fetching seasons: ${err.message}`);
          console.error("Error fetching seasons:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchSeasons();
  }, [selectedCrop]);

  // Update states when season changes
  useEffect(() => {
    async function fetchStates() {
      if (selectedCrop && selectedSeason) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/crop-data/states?crop=${encodeURIComponent(selectedCrop)}&season=${encodeURIComponent(selectedSeason)}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch states");
          }

          const statesList = await response.json();
          setStates(statesList);
          // Reset state selection
          setSelectedState("");
        } catch (err) {
          setError(`Error fetching states: ${err.message}`);
          console.error("Error fetching states:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchStates();
  }, [selectedCrop, selectedSeason]);

  // Fetch crop data when all selections are made
  useEffect(() => {
    async function fetchCropData() {
      if (selectedCrop && selectedSeason && selectedState) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/crop-data/crop-info?crop=${encodeURIComponent(selectedCrop)}&season=${encodeURIComponent(selectedSeason)}&state=${encodeURIComponent(selectedState)}`,
          );

          if (!response.ok) {
            throw new Error("Failed to fetch crop info");
          }

          const data = await response.json();
          setCropData(data);
        } catch (err) {
          setError(`Error fetching crop info: ${err.message}`);
          console.error("Error fetching crop info:", err);
          setCropData(null);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchCropData();
  }, [selectedCrop, selectedSeason, selectedState]);

  return (
    <div className="p-8 pt-12 w-full bg-gray-50 min-h-screen">
      <div className="min-h-[95vh] bg-white p-4 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-mtn-green-800">
          Crop Calendar Selector
        </h1>

        {
          //   error && (
          //   <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          //     {error}
          //   </div>
          // )
        }

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
              disabled={isLoading}
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
              disabled={!selectedCrop || isLoading}
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
              disabled={!selectedSeason || isLoading}
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mtn-green-800"></div>
          </div>
        )}

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
    </div>
  );
}

export default CropDate;
