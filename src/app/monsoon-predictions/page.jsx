"use client";
// pages/monsoon-predictions.js
import { useState } from "react";
import Head from "next/head";
import HistoricalTab from "@/components/monsoon-predictions/HistoricalTab";
import PredictionsTab from "@/components/monsoon-predictions/PredictionsTab";
import AccuracyTab from "@/components/monsoon-predictions/AccuracyTab";

// Tab button component
const TabButton = ({ label, isActive, onClick }) => (
  <button
    className={`px-4 py-2 rounded-md border w-1/3 shadow-lg transition-colors ${
      isActive
        ? "bg-mtn-green-800 text-white font-medium"
        : "hover:bg-green-100 text-mtn-green-900"
    }`}
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
        <div className="flex-1 bg-gray-50">
          <div className="rounded-3xl border border-gray-200 bg-white m-4 overflow-hidden">
            <div className="p-4">
              <h1 className="text-4xl font-bold text-mtn-green-800 mb-4">
                All India Monsoon Predictions
              </h1>

              {/* Tabs navigation */}
              <div className="mt-4 flex space-x-6">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    label={tab.id}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>

              {/* Tab content */}
              {activeComponent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
