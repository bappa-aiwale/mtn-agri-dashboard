"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the chart components to avoid SSR issues with Plotly
const AllYearRainfallChart = dynamic(() => import("./AllYearRainfallChart"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center ">
      <div className="animate-pulse text-mtn-green-800">
        Loading All Year data...
      </div>
    </div>
  ),
});

const MonsoonRainfallChart = dynamic(() => import("./MonsoonRainfallChart"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center">
      <div className="animate-pulse text-mtn-green-800">
        Loading Monsoon data...
      </div>
    </div>
  ),
});

function HistoricalTab() {
  const [activeView, setActiveView] = useState("monsoon");

  const ChartButton = ({ id, label }) => (
    <button
      className={`w-full shadow-lg px-4 py-2 rounded-lg font-medium transition-colors ${
        activeView === id
          ? "bg-mtn-green-800 text-white"
          : " text-gray-700 hover:bg-green-100"
      }`}
      onClick={() => setActiveView(id)}
      aria-pressed={activeView === id}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-4 text-mtn-green-800">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartButton id="monsoon" label="Monsoon" />
        <ChartButton id="allyear" label="All Year" />
      </div>

      <div className="w-full bg-white p-1">
        {activeView === "monsoon" ? (
          <MonsoonRainfallChart />
        ) : (
          <AllYearRainfallChart />
        )}
      </div>
    </div>
  );
}

export default HistoricalTab;
