"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createColorBar, getMonthName } from "@/utils/rainfallDataProcessor";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function MonsoonRainfallChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch data from API with monsoon filter enabled
        console.log("Fetching monsoon data from API...");
        const response = await fetch("/api/rainfall?monsoon=true");

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API response not OK:", response.status, errorText);
          throw new Error(
            `Failed to fetch rainfall data: ${response.status} ${errorText}`,
          );
        }

        const result = await response.json();
        console.log("API response received:", result.success);

        if (!result.success) {
          throw new Error(result.error || "Unknown error");
        }

        // Check if data exists
        if (!result.data || !result.data.yearlyData) {
          console.error("Invalid data structure:", result);
          throw new Error("Invalid data structure received from API");
        }

        // Process data for plotting
        console.log("Processing monsoon data for plotting...");
        processPlotData(result.data);
        console.log("Monsoon data processed successfully");
      } catch (err) {
        console.error("Error fetching monsoon rainfall data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const processPlotData = (data) => {
    const { yearlyData, minValue, maxValue } = data;

    if (Object.keys(yearlyData).length === 0) {
      setError("No monsoon rainfall data available");
      return;
    }

    // Get sorted years
    const years = Object.keys(yearlyData)
      .filter((year) => year !== "2025") // Exclude 2025 as in Python code
      .sort((a, b) => parseInt(a) - parseInt(b));

    // Calculate grid layout
    const rows = Math.ceil(years.length / 5);
    const cols = Math.min(years.length, 5);

    // Build subplot data
    const plotConfig = {
      rows,
      cols,
      years,
      subplots: [],
      layout: {
        title: {
          text: "Monthly Average Rainfall during Monsoon",
          font: {
            size: 24,
            family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
            color: "#2F4F4F",
          },
          x: 0.5,
        },
        height: 800,
        width: 1200,
        autosize: true,
        showlegend: false,
        grid: { rows, columns: cols, pattern: "independent" },
        annotations: [],
        paper_bgcolor: "white",
        plot_bgcolor: "rgba(240, 240, 250, 0.5)",
        font: {
          family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
        },
        margin: {
          l: 50,
          r: 30,
          t: 80,
          b: 80,
        },
        uniformtext: {
          mode: "show",
          minsize: 10,
        },
      },
    };

    // Create each subplot
    years.forEach((year, index) => {
      const row = Math.floor(index / cols) + 1;
      const col = (index % cols) + 1;

      // Sort data by month
      const yearData = yearlyData[year].sort((a, b) => a.Month - b.Month);

      // Define x-axis tick values - monsoon months only (Jun-Sep)
      const tickVals = [6, 7, 8, 9];
      const tickText = ["Jun", "Jul", "Aug", "Sep"];

      // Create colors and hover text
      const colors = yearData.map((item) =>
        createColorBar(item["Index Value"], minValue, maxValue),
      );

      const hoverText = yearData.map(
        (item) =>
          `<b>Year:</b> ${item.Year}<br><b>Month:</b> ${getMonthName(item.Month)}<br><b>Index Value:</b> ${item["Index Value"].toFixed(2)}`,
      );

      // Add subplot
      plotConfig.subplots.push({
        type: "bar",
        x: yearData.map((item) => item.Month),
        y: yearData.map((item) => item["Index Value"]),
        marker: { color: colors },
        text: yearData.map((item) => item["Index Value"].toFixed(2)),
        textposition: "auto",
        hoverinfo: "text",
        hovertext: hoverText,
        textfont: {
          size: 12,
          color: "#000",
        },
        xaxis: `x${index + 1}`,
        yaxis: `y${index + 1}`,
        width: 0.7, // Make bars wider
      });

      // Add subplot title
      plotConfig.layout.annotations.push({
        text: `Year ${year}`,
        font: {
          size: 16,
          family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
          color: "#2F4F4F",
        },
        showarrow: false,
        x: 0.5 + (col - 1) / cols,
        y: 1.05 - (row - 1) / rows,
        xref: "paper",
        yref: "paper",
      });

      // Configure axes
      plotConfig.layout[`xaxis${index + 1}`] = {
        title: {
          text: "Month",
          font: {
            size: 12,
            family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
          },
        },
        tickmode: "array",
        tickvals: tickVals,
        ticktext: tickText,
        tickangle: 0, // Changed from 90 to match original
        tickfont: {
          size: 10,
          family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
        },
        domain: [(col - 1) / cols, col / cols],
        anchor: `y${index + 1}`,
        showgrid: false,
      };

      plotConfig.layout[`yaxis${index + 1}`] = {
        title: {
          text: index % cols === 0 ? "Rainfall Index Value" : "",
          font: {
            size: 12,
            family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
          },
        },
        tickfont: {
          size: 10,
          family: "Comic Neue, Comic Sans MS, Arial, sans-serif",
        },
        domain: [1 - row / rows, 1 - (row - 1) / rows],
        anchor: `x${index + 1}`,
        showgrid: false,
      };
    });

    setPlotData(plotConfig);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-mtn-green-800">
          Loading monsoon data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-red-500 p-4">
        <div className="text-xl font-bold mb-2">Error loading data</div>
        <div>{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-mtn-green-800 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!plotData) {
    return <div className="text-center p-4">No data available</div>;
  }

  return (
    <div className="h-full w-full">
      <Plot
        data={plotData.subplots}
        layout={plotData.layout}
        config={{
          responsive: true,
          displayModeBar: false, // Hide the mode bar to match the static image
          displaylogo: false,
          staticPlot: false, // Make it still interactive but with simpler appearance
        }}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
      />
    </div>
  );
}
