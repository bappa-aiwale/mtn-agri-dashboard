/**
 * Utility functions to process rainfall data
 */

/**
 * Process rainfall data from CSV
 * @param {Array} data - Raw CSV data
 * @returns {Object} Processed data with monthly averages
 */
export function processRainfallData(data) {
  // Convert strings to appropriate types
  const parsedData = data.map((row) => ({
    Date: new Date(row.Date),
    "Index Value": parseFloat(row["Index Value"]),
    Year: parseInt(row.Year || new Date(row.Date).getFullYear()),
    Month: parseInt(row.Month || new Date(row.Date).getMonth() + 1),
  }));

  // Sort by date
  parsedData.sort((a, b) => a.Date - b.Date);

  // Remove duplicates by selecting best value
  const uniqueDates = new Map();

  parsedData.forEach((row) => {
    const dateStr = row.Date.toISOString().split("T")[0];

    if (!uniqueDates.has(dateStr) || !isNaN(row["Index Value"])) {
      uniqueDates.set(dateStr, row);
    }
  });

  const uniqueData = Array.from(uniqueDates.values());

  // Group by year and month
  const monthlyData = groupByYearAndMonth(uniqueData);

  return {
    dailyData: uniqueData,
    monthlyData: monthlyData,
  };
}

/**
 * Group data by year and month and calculate averages
 * @param {Array} data - Daily data
 * @returns {Array} Monthly averages by year
 */
function groupByYearAndMonth(data) {
  const groupedData = {};

  // Group data by year and month
  data.forEach((row) => {
    const year = row.Year;
    const month = row.Month;
    const value = row["Index Value"];

    if (!groupedData[year]) {
      groupedData[year] = {};
    }

    if (!groupedData[year][month]) {
      groupedData[year][month] = [];
    }

    if (!isNaN(value)) {
      groupedData[year][month].push(value);
    }
  });

  // Calculate averages
  const monthlyAverages = [];

  Object.keys(groupedData).forEach((year) => {
    Object.keys(groupedData[year]).forEach((month) => {
      const values = groupedData[year][month];
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      monthlyAverages.push({
        Year: parseInt(year),
        Month: parseInt(month),
        "Index Value": average,
      });
    });
  });

  return monthlyAverages;
}

/**
 * Filter data for monsoon months (June-September)
 * @param {Array} data - Monthly data
 * @returns {Array} Filtered data for monsoon months
 */
export function filterMonsoonMonths(data) {
  return data.filter((row) => [6, 7, 8, 9].includes(row.Month));
}

/**
 * Create color based on value (red for negative, blue for positive)
 * @param {number} value - Index value
 * @param {number} minValue - Minimum value in dataset
 * @param {number} maxValue - Maximum value in dataset
 * @returns {string} RGBA color string
 */
export function createColorBar(value, minValue, maxValue) {
  if (value < 0) {
    // Negative values: red with darkness proportional to magnitude
    const intensity =
      Math.abs(minValue) > 0 ? Math.abs(value) / Math.abs(minValue) : 0;
    return `rgba(255, ${Math.floor(220 - 150 * intensity)}, ${Math.floor(220 - 150 * intensity)}, 0.8)`;
  } else {
    // Positive values: blue with darkness proportional to magnitude
    const intensity = maxValue > 0 ? value / maxValue : 0;
    return `rgba(${Math.floor(220 - 150 * intensity)}, ${Math.floor(220 - 150 * intensity)}, 255, 0.8)`;
  }
}

/**
 * Get the month name
 * @param {number} month - Month number (1-12)
 * @param {boolean} short - Whether to return short name
 * @returns {string} Month name
 */
export function getMonthName(month, short = false) {
  const months = [
    { short: "Jan", full: "January" },
    { short: "Feb", full: "February" },
    { short: "Mar", full: "March" },
    { short: "Apr", full: "April" },
    { short: "May", full: "May" },
    { short: "Jun", full: "June" },
    { short: "Jul", full: "July" },
    { short: "Aug", full: "August" },
    { short: "Sep", full: "September" },
    { short: "Oct", full: "October" },
    { short: "Nov", full: "November" },
    { short: "Dec", full: "December" },
  ];

  return short ? months[month - 1].short : months[month - 1].full;
}
