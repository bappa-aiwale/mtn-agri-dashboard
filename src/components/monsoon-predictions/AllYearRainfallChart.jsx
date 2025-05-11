"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getMonthName } from "@/utils/rainfallDataProcessor";

const AllYearRainfallChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    yearlyData: {},
    minValue: 0,
    maxValue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the monsoon=false parameter to get all months data
        const response = await fetch("/api/rainfall?monsoon=false");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Something went wrong");
        }

        setChartData(result.data);
      } catch (err) {
        console.error("Error fetching rainfall data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse text-mtn-green-800">
          Loading all year rainfall data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">
          Error: {error}. Please try again later.
        </div>
      </div>
    );
  }

  // Get sorted years for display, exclude 2025 if present
  const years = Object.keys(chartData.yearlyData)
    .filter((year) => year !== "2025")
    .sort();

  // Function to determine bar color based on value
  const getBarColor = (value) => {
    return value >= 0 ? "rgba(99, 132, 255, 0.8)" : "rgba(255, 99, 132, 0.8)";
  };

  // Create a custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{`${getMonthName(data.month)} ${data.year}`}</p>
          <p className="text-sm">{`Index Value: ${data.value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for display - transform to Recharts format
  const prepareChartData = (year) => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12 for all months

    return months.map((month) => {
      const dataPoint = chartData.yearlyData[year]?.find(
        (item) => item.Month === month,
      );
      return {
        month,
        year,
        value: dataPoint ? dataPoint["Index Value"] : 0,
        monthName: getMonthName(month, true),
      };
    });
  };

  // Calculate domain for Y axis based on data
  const yDomain = [
    Math.min(Math.floor(chartData.minValue * 1.1), -71),
    Math.max(Math.ceil(chartData.maxValue * 1.1), 40),
  ];

  // Render a single year chart
  const renderYearChart = (year) => {
    const data = prepareChartData(year);

    return (
      <div key={year} className="bg-white rounded-lg">
        <div className="text-center font-semibold text-mtn-green-800 mb-1 text-sm">
          Year {year}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              barSize={8} // Smaller bars to fit all 12 months
            >
              <XAxis
                dataKey="monthName"
                tick={false}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                ticks={[-71, -41, -11, 0, 40]}
                tick={{ fontSize: 9 }}
                width={30}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
                label={{
                  value: "Rainfall Index Value",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 9, fill: "#2d5a4d" },
                  dx: -15,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" animationDuration={500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
                {data.map((entry, index) => {
                  // Only show significant values to avoid clutter
                  if (Math.abs(entry.value) > 5) {
                    return (
                      <text
                        key={`value-${index}`}
                        x={index * (100 / data.length) + 100 / data.length / 2}
                        y={entry.value >= 0 ? 30 : 130}
                        textAnchor="middle"
                        fill={entry.value >= 0 ? "#333" : "#fff"}
                        fontSize={8} // Smaller font for value labels
                        fontWeight="bold"
                      >
                        {entry.value.toFixed(1)}
                      </text>
                    );
                  }
                  return null;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-center text-mtn-green-800 mb-4">
        Monthly Average Rainfall
      </h2>

      {/* Add a key line explaining the Y-axis */}
      <div className="text-center text-sm mb-2 text-gray-600">
        Rainfall Index Value: Deviation from historical average (%)
      </div>

      {/* First row: 5 columns for first 5 years */}
      <div className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {years.map((year) => renderYearChart(year))}
        </div>
      </div>
    </div>
  );
};

export default AllYearRainfallChart;
