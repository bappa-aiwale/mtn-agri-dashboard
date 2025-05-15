"use client";

import { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";

export default function ComparisonSankeyDiagram({ data }) {
  const sankeyContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [containerHeight, setContainerHeight] = useState("100vh");

  // Function to check if the screen is mobile and calculate appropriate height
  const checkMobileAndSetHeight = () => {
    const isMobileView = window.innerWidth < 768;
    setIsMobile(isMobileView);

    if (data) {
      // Count unique crops and districts
      const cropCount = new Set(data.crop_name).size;
      const districtCount = new Set(data.district_name).size;

      // Dynamically set height based on number of elements
      // Apply the same height logic for both desktop and mobile as requested
      if (cropCount >= 30 || districtCount >= 30) {
        setContainerHeight("120vh");
      } else if (cropCount >= 20 || districtCount >= 20) {
        setContainerHeight("110vh");
      } else if (cropCount >= 10 || districtCount >= 10) {
        setContainerHeight("75vh");
      } else {
        setContainerHeight("75vh");
      }
    } else {
      // Default height if no data
      setContainerHeight("75vh");
    }
  };

  useEffect(() => {
    // Check initially and add resize listener
    checkMobileAndSetHeight();
    window.addEventListener("resize", checkMobileAndSetHeight);

    // Force redraw when orientation changes on mobile devices
    window.addEventListener("orientationchange", () => {
      setTimeout(checkMobileAndSetHeight, 100);
    });

    return () => {
      window.removeEventListener("resize", checkMobileAndSetHeight);
      window.removeEventListener("orientationchange", checkMobileAndSetHeight);
    };
  }, [data]); // Added data as dependency to recalculate when data changes

  useEffect(() => {
    if (!data || !sankeyContainerRef.current) return;

    // Store a reference to the current container element
    const container = sankeyContainerRef.current;

    // Define the columns for the Sankey diagram in the desired order (left to right)
    const columns = ["state_name", "season_name", "crop_name", "district_name"];

    // For mobile, we'll truncate long labels
    const truncateLabel = (label, maxLength) => {
      if (!isMobile || !label) return label;

      // Dynamically adjust max length based on number of nodes
      const cropCount = new Set(data.crop_name).size;
      const districtCount = new Set(data.district_name).size;
      const totalCount = cropCount + districtCount;

      // More aggressive truncation when there are many nodes
      let dynamicMaxLength = 10; // default

      if (totalCount > 50) dynamicMaxLength = 6;
      else if (totalCount > 30) dynamicMaxLength = 8;

      if (label.length > dynamicMaxLength) {
        return label.substring(0, dynamicMaxLength) + "...";
      }
      return label;
    };

    // Create unique indices for values in each column
    const valueIndices = {};
    let currentIndex = 0;

    // Process labels - create a mapping of original to truncated labels for mobile
    const labelMap = {};

    for (const col of columns) {
      // Get unique values
      const uniqueValues = [...new Set(data[col])];
      valueIndices[col] = {};

      // Assign indices and create label mapping
      for (let i = 0; i < uniqueValues.length; i++) {
        const originalValue = uniqueValues[i];
        valueIndices[col][originalValue] = currentIndex + i;

        // Create mapping for original to truncated label
        if (isMobile) {
          labelMap[originalValue] = truncateLabel(originalValue);
        }
      }

      currentIndex += uniqueValues.length;
    }

    // Create sources, targets and values for Sankey diagram
    const sources = [];
    const targets = [];
    const values = [];
    const labels = [];
    const colors = [];

    // Define a more saturated color map for different columns
    const colorMap = {
      state_name: "rgba(100, 181, 246, 0.9)", // More saturated blue for state
      season_name: "rgba(129, 199, 132, 0.9)", // More saturated green for seasons
      crop_name: "rgba(255, 183, 77, 0.9)", // More saturated orange for crops
      district_name: "rgba(186, 104, 200, 0.9)", // More saturated purple for districts
    };

    // Collect all node labels and colors
    for (const col of columns) {
      const uniqueValues = [...new Set(data[col])];
      for (const val of uniqueValues) {
        // Use truncated labels for mobile
        labels.push(isMobile ? truncateLabel(val) : val);
        colors.push(colorMap[col]);
      }
    }

    // Create links between columns and define link colors
    const linkColors = [];

    for (let i = 0; i < columns.length - 1; i++) {
      const colSource = columns[i];
      const colTarget = columns[i + 1];

      // Generate a color for links between these two column types
      const sourceColor = colorMap[colSource];

      // Create a dictionary to aggregate production values for each source-target pair
      const pairProductions = {};

      for (let j = 0; j < data[colSource].length; j++) {
        const sourceVal = data[colSource][j];
        const targetVal = data[colTarget][j];
        const production = data.production[j] || 1; // Use 1 as default if no production data

        const pairKey = `${sourceVal}-${targetVal}`;
        if (!pairProductions[pairKey]) {
          pairProductions[pairKey] = {
            source: sourceVal,
            target: targetVal,
            value: 0,
          };
        }

        pairProductions[pairKey].value += production;
      }

      // Add aggregated production values to sources, targets and values
      for (const pairKey in pairProductions) {
        const pair = pairProductions[pairKey];

        // Only include pairs with positive production values
        if (pair.value > 0) {
          sources.push(valueIndices[colSource][pair.source]);
          targets.push(valueIndices[colTarget][pair.target]);
          values.push(pair.value);

          // Create link colors that match the source node but with more opacity
          const rgba = sourceColor.match(
            /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/,
          );
          if (rgba) {
            linkColors.push(`rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, 0.6)`);
          } else {
            linkColors.push(sourceColor);
          }
        }
      }
    }

    // Determine if we should use vertical layout for mobile
    const orientation = isMobile ? "v" : "h";

    // Calculate positions for each column based on orientation
    const xPositions = [];
    const yPositions = [];

    if (orientation === "h") {
      // Horizontal layout (desktop)
      for (let i = 0; i < columns.length; i++) {
        const uniqueVals = [...new Set(data[columns[i]])];
        for (let j = 0; j < uniqueVals.length; j++) {
          xPositions.push(i / (columns.length - 1));
          yPositions.push(null); // Not used in horizontal layout
        }
      }
    } else {
      // Vertical layout (mobile)
      for (let i = 0; i < columns.length; i++) {
        const uniqueVals = [...new Set(data[columns[i]])];
        for (let j = 0; j < uniqueVals.length; j++) {
          yPositions.push(i / (columns.length - 1));
          xPositions.push(null); // Not used in vertical layout
        }
      }
    }

    // Get the number of unique values in each column for more precise spacing
    const numUniqueStateValues = new Set(data.state_name).size;
    const numUniqueSeasonValues = new Set(data.season_name).size;
    const numUniqueCropValues = new Set(data.crop_name).size;
    const numUniqueDistrictValues = new Set(data.district_name).size;

    // Adjust node padding based on the number of nodes
    const maxNodes = Math.max(
      numUniqueStateValues,
      numUniqueSeasonValues,
      numUniqueCropValues,
      numUniqueDistrictValues,
    );

    // Different padding and thickness settings for mobile vs desktop
    let dynamicPadding, dynamicThickness, dynamicFontSize;

    if (isMobile) {
      // Mobile settings - more aggressive space saving
      dynamicPadding = maxNodes > 25 ? 5 : maxNodes > 15 ? 8 : 10;
      dynamicThickness = maxNodes > 30 ? 8 : maxNodes > 20 ? 10 : 12;
      dynamicFontSize = maxNodes > 30 ? 7 : maxNodes > 20 ? 8 : 9;
    } else {
      // Desktop settings - more space to work with
      dynamicPadding = maxNodes > 30 ? 10 : maxNodes > 20 ? 12 : 15;
      dynamicThickness = maxNodes > 30 ? 15 : maxNodes > 20 ? 18 : 20;
      dynamicFontSize = maxNodes > 30 ? 10 : maxNodes > 20 ? 12 : 14;
    }

    // Create the Sankey diagram
    const sankeyData = {
      type: "sankey",
      orientation: orientation,
      node: {
        pad: dynamicPadding,
        thickness: dynamicThickness,
        line: {
          color: "white",
          width: 0.5,
        },
        label: labels,
        color: colors,
        // Only use x/y position based on orientation
        x: orientation === "h" ? xPositions : undefined,
        y: orientation === "v" ? yPositions : undefined,
        font: {
          size: dynamicFontSize,
          color: "#333",
        },
      },
      link: {
        source: sources,
        target: targets,
        value: values,
        color: linkColors,
        // Increase link transparency on mobile to reduce visual clutter
        opacity: isMobile ? 0.7 : 0.8,
      },
    };

    const layout = {
      title: {
        text: isMobile
          ? `Agricultural Flow`
          : `Agricultural Flow: State → Season → Crop → District`,
        font: {
          size: isMobile ? 16 : 22,
        },
      },
      font: {
        size: isMobile ? 12 : 16,
      },
      autosize: true,
      margin: {
        l: isMobile ? 40 : 50,
        r: isMobile ? 40 : 50,
        t: isMobile ? 40 : 50,
        b: isMobile ? 40 : 50,
      },
      paper_bgcolor: "rgb(255, 255, 255)",
      plot_bgcolor: "rgb(255, 255, 255)",
    };

    // Configuration for improved interactivity
    const config = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
      // Add tooltips on hover
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "#FFF",
        font: { size: 12 },
        bordercolor: "#DDD",
      },
    };

    // Get container and render the diagram
    Plotly.newPlot(container, [sankeyData], layout, config);

    // Cleanup function to prevent memory leaks
    return () => {
      Plotly.purge(container);
    };
  }, [data, isMobile]); // Added isMobile as a dependency

  if (!data) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-md shadow-sm p-4">
      {isMobile && (
        <div className="text-sm text-red-500 text-center mt-2 mb-4">
          Note: For best view rotate the screen
        </div>
      )}
      <div
        ref={sankeyContainerRef}
        className="w-full"
        style={{ height: containerHeight }}
      ></div>
    </div>
  );
}
