"use client";
// pages/monsoon-predictions.js
import { useState } from "react";
import Head from "next/head";
import HistoricalTab from "@/components/monsoon-predictions/HistoricalTab";
import PredictionsTab from "@/components/monsoon-predictions/PredictionsTab";
import AccuracyTab from "@/components/monsoon-predictions/AccuracyTab";

// Tab button component with responsive width
const TabButton = ({ label, isActive, onClick }) => (
  <button
    className={`px-2 sm:px-4 py-2 rounded-md border shadow-lg transition-colors ${
      isActive
        ? "bg-mtn-green-800 text-white font-medium"
        : "hover:bg-green-100 text-mtn-green-900"
    } w-full text-sm sm:text-base`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default function MonsoonPredictions() {
  const [activeTab, setActiveTab] = useState("2025 Predictions");
  const tabs = [
    { id: "2025 Predictions", component: <PredictionsTab /> },
    { id: "Prediction Accuracy", component: <AccuracyTab /> },
    { id: "Historical Data", component: <HistoricalTab /> },
  ];

  // Find the active tab's component
  const activeComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || null;

  return (
    <>
      <Head>
        <title>All India Monsoon Predictions | Weather Analysis</title>
        <meta
          name="description"
          content="Monsoon predictions and historical data for India"
        />
      </Head>
      <div className="flex min-h-screen">
        <div className="flex-1 bg-gray-50 p-8 pt-12 w-full">
          <div className="rounded-xl border border-gray-200 bg-white mx-0 sm:m-4 p-1 overflow-hidden">
            <div className="p-2 sm:p-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-mtn-green-800 mb-4 sm:mb-8 text-center sm:text-left">
                All India Monsoon Predictions
              </h1>

              {/* Tabs navigation - stacked on mobile, horizontal on larger screens */}
              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                {tabs.map((tab) => (
                  <div key={tab.id} className="sm:w-1/3">
                    <TabButton
                      label={tab.id}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-4 sm:mt-6">{activeComponent}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
