#!/usr/bin/env node
/**
 * Parse k6 JSON results and create visualizations showing HTTP metrics vs VU count
 */

const fs = require("fs");
const path = require("path");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

function calculatePercentile(sortedValues, percentile) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((sortedValues.length - 1) * (percentile / 100));
  return sortedValues[index];
}

function createInteractiveHTML(
  resultsDict,
  vuCounts,
  durationAvg,
  durationMin,
  durationMed,
  durationMax,
  durationP90,
  durationP95,
  failedRate,
  reqsCount,
  outputDir,
  baseName
) {
  const htmlPath = path.join(outputDir, `${baseName}_report.html`);

  // Serialize data for JavaScript
  const dataScript = `
    const chartData = {
      vuCounts: ${JSON.stringify(vuCounts)},
      durationAvg: ${JSON.stringify(durationAvg)},
      durationMin: ${JSON.stringify(durationMin)},
      durationMed: ${JSON.stringify(durationMed)},
      durationMax: ${JSON.stringify(durationMax)},
      durationP90: ${JSON.stringify(durationP90)},
      durationP95: ${JSON.stringify(durationP95)},
      failedRate: ${JSON.stringify(failedRate)},
      reqsCount: ${JSON.stringify(reqsCount)}
    };
  `;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Profile Load Test Results - Interactive</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f5f5f5;
      margin: 0;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin: 0 0 20px 0;
      text-align: center;
    }
    .controls {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .control-group label {
      font-weight: bold;
      color: #555;
    }
    .control-group input[type="number"] {
      width: 80px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .control-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .control-group button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .control-group button:hover {
      background-color: #45a049;
    }
    .charts-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }
    .chart-wrapper {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: relative;
    }
    .chart-wrapper canvas {
      max-height: 500px;
    }
    .chart-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Profile Load Test Results - HTTP Metrics vs VU Count</h1>
    <div class="controls">
      <div class="control-group">
        <label for="thresholdInput">Threshold (seconds):</label>
        <input type="number" id="thresholdInput" value="1.5" step="0.1" min="0" />
        <button onclick="updateThreshold()">Update Threshold</button>
      </div>
      <div class="control-group">
        <input type="checkbox" id="toggleMinMax" checked />
        <label for="toggleMinMax">Show Min/Max Lines</label>
      </div>
    </div>
  </div>

  <div class="charts-container">
    <div class="chart-wrapper">
      <div class="chart-title">HTTP Request Duration Statistics</div>
      <canvas id="chart1"></canvas>
    </div>
    <div class="chart-wrapper">
      <div class="chart-title">HTTP Request Duration Percentiles</div>
      <canvas id="chart2"></canvas>
    </div>
    <div class="chart-wrapper">
      <div class="chart-title">HTTP Request Failed Rate</div>
      <canvas id="chart3"></canvas>
    </div>
    <div class="chart-wrapper">
      <div class="chart-title">Total HTTP Requests</div>
      <canvas id="chart4"></canvas>
    </div>
  </div>

  <script>
    ${dataScript}

    let chart1, chart2, chart3, chart4;
    let currentThreshold = 1.5;
    let showMinMax = true;

    const commonConfig = {
      type: 'line',
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    function getThresholdDataset() {
      return {
        label: \`Threshold (\${currentThreshold}s)\`,
        data: chartData.vuCounts.map(() => currentThreshold),
        borderColor: 'rgb(255, 0, 0)',
        borderDash: [10, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 0,
      };
    }

    function getDurationStatsDatasets() {
      const datasets = [
        {
          label: 'Average',
          data: chartData.durationAvg,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          pointRadius: 5,
        },
      ];

      if (showMinMax) {
        datasets.push(
          {
            label: 'Min',
            data: chartData.durationMin,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 5,
          },
          {
            label: 'Max',
            data: chartData.durationMax,
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 5,
          }
        );
      }

      datasets.push({
        label: 'Median',
        data: chartData.durationMed,
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.1,
        pointRadius: 5,
      });

      datasets.push(getThresholdDataset());

      return datasets;
    }

    function initCharts() {
      // Chart 1: Duration Statistics
      chart1 = new Chart(document.getElementById('chart1'), {
        ...commonConfig,
        data: {
          labels: chartData.vuCounts,
          datasets: getDurationStatsDatasets(),
        },
        options: {
          ...commonConfig.options,
          plugins: {
            ...commonConfig.options.plugins,
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Virtual Users (VUs)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (seconds)',
              },
            },
          },
        },
      });

      // Chart 2: Duration Percentiles
      chart2 = new Chart(document.getElementById('chart2'), {
        ...commonConfig,
        data: {
          labels: chartData.vuCounts,
          datasets: [
            {
              label: 'p(90)',
              data: chartData.durationP90,
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              tension: 0.1,
              pointRadius: 5,
            },
            {
              label: 'p(95)',
              data: chartData.durationP95,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1,
              pointRadius: 5,
            },
            getThresholdDataset(),
          ],
        },
        options: {
          ...commonConfig.options,
          plugins: {
            ...commonConfig.options.plugins,
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Virtual Users (VUs)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (seconds)',
              },
            },
          },
        },
      });

      // Chart 3: Failed Rate
      chart3 = new Chart(document.getElementById('chart3'), {
        ...commonConfig,
        data: {
          labels: chartData.vuCounts,
          datasets: [
            {
              label: 'Failed Rate',
              data: chartData.failedRate,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.1,
              pointRadius: 5,
            },
            {
              label: 'Threshold (1%)',
              data: chartData.vuCounts.map(() => 1.0),
              borderColor: 'rgb(255, 0, 0)',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          ...commonConfig.options,
          plugins: {
            ...commonConfig.options.plugins,
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Virtual Users (VUs)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Failed Rate (%)',
              },
            },
          },
        },
      });

      // Chart 4: Total Requests
      chart4 = new Chart(document.getElementById('chart4'), {
        ...commonConfig,
        data: {
          labels: chartData.vuCounts,
          datasets: [
            {
              label: 'Total Requests',
              data: chartData.reqsCount,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              pointRadius: 5,
            },
          ],
        },
        options: {
          ...commonConfig.options,
          plugins: {
            ...commonConfig.options.plugins,
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Virtual Users (VUs)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Requests',
              },
            },
          },
        },
      });

      // Setup toggle event listener
      document.getElementById('toggleMinMax').addEventListener('change', function(e) {
        showMinMax = e.target.checked;
        updateCharts();
      });
    }

    function updateThreshold() {
      const threshold = parseFloat(document.getElementById('thresholdInput').value);
      if (!isNaN(threshold) && threshold >= 0) {
        currentThreshold = threshold;
        updateCharts();
      } else {
        alert('Please enter a valid threshold value (>= 0)');
      }
    }

    function updateCharts() {
      // Update Chart 1 (Duration Statistics)
      chart1.data.datasets = getDurationStatsDatasets();
      chart1.update();

      // Update Chart 2 (Duration Percentiles)
      const thresholdDataset = getThresholdDataset();
      chart2.data.datasets[2] = thresholdDataset;
      chart2.update();
    }

    // Initialize charts when page loads
    window.addEventListener('DOMContentLoaded', initCharts);
  </script>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✓ Interactive HTML report saved: ${htmlPath}`);
}

function parseK6Json(filePath) {
  try {
    // k6 outputs NDJSON (newline-delimited JSON) format
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Collect data points
    const durationValues = [];
    let totalReqs = 0;
    let failedReqs = 0;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);

        // Only process Point type entries (skip Metric type definitions)
        if (obj.type !== "Point") continue;

        // Skip setup requests
        const isSetup = obj.data?.tags?.group === "::setup";
        if (isSetup) continue;

        // Collect http_req_duration values (in ms)
        if (
          obj.metric === "http_req_duration" &&
          obj.data &&
          obj.data.value !== undefined
        ) {
          durationValues.push(obj.data.value);
        }

        // Count total requests (each http_reqs point with value=1 represents one request)
        if (
          obj.metric === "http_reqs" &&
          obj.data &&
          obj.data.value !== undefined
        ) {
          totalReqs += obj.data.value;
        }

        // Count failed requests (value > 0 means failed)
        if (
          obj.metric === "http_req_failed" &&
          obj.data &&
          obj.data.value !== undefined
        ) {
          if (obj.data.value > 0) {
            failedReqs++;
          }
        }
      } catch (parseError) {
        // Skip invalid JSON lines
        continue;
      }
    }

    // Calculate statistics
    if (durationValues.length === 0) {
      console.warn(`Warning: No duration data found in ${filePath}`);
      return null;
    }

    // Sort for percentile calculation
    const sortedDuration = [...durationValues].sort((a, b) => a - b);

    const avg =
      durationValues.reduce((sum, val) => sum + val, 0) / durationValues.length;
    const min = sortedDuration[0];
    const max = sortedDuration[sortedDuration.length - 1];
    const med = calculatePercentile(sortedDuration, 50);
    const p90 = calculatePercentile(sortedDuration, 90);
    const p95 = calculatePercentile(sortedDuration, 95);

    // Calculate failure rate
    const failureRate = totalReqs > 0 ? (failedReqs / totalReqs) * 100 : 0;

    return {
      duration: {
        avg: avg / 1000, // Convert ms to seconds
        min: min / 1000,
        med: med / 1000,
        max: max / 1000,
        p90: p90 / 1000,
        p95: p95 / 1000,
      },
      failed: {
        rate: failureRate,
      },
      reqs: {
        count: totalReqs,
      },
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}: ${error.message}`);
    return null;
  }
}

function createPlots(resultsDict, outputPath) {
  // Sort by VU count
  const sortedVUs = Object.keys(resultsDict).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  const vuCounts = sortedVUs.map((vu) => parseInt(vu));

  // Prepare data
  const durationAvg = sortedVUs.map((vu) => resultsDict[vu].duration.avg);
  const durationMin = sortedVUs.map((vu) => resultsDict[vu].duration.min);
  const durationMed = sortedVUs.map((vu) => resultsDict[vu].duration.med);
  const durationMax = sortedVUs.map((vu) => resultsDict[vu].duration.max);
  const durationP90 = sortedVUs.map((vu) => resultsDict[vu].duration.p90);
  const durationP95 = sortedVUs.map((vu) => resultsDict[vu].duration.p95);
  const failedRate = sortedVUs.map((vu) => resultsDict[vu].failed.rate);
  const reqsCount = sortedVUs.map((vu) => resultsDict[vu].reqs.count);

  const outputDir = path.dirname(outputPath);
  const baseName = path.basename(outputPath, path.extname(outputPath));

  const width = 1600;
  const height = 1200;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  // Configuration for all charts
  const chartConfig = {
    type: "line",
    data: {
      labels: vuCounts,
      datasets: [],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  // Chart 1: HTTP Request Duration - Statistics
  const chart1 = {
    ...chartConfig,
    data: {
      labels: vuCounts,
      datasets: [
        {
          label: "Average",
          data: durationAvg,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "Min",
          data: durationMin,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "Median",
          data: durationMed,
          borderColor: "rgb(255, 206, 86)",
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "Max",
          data: durationMax,
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderDash: [5, 5],
          tension: 0.1,
          pointRadius: 5,
        },
        // Threshold at 1.5s
        {
          label: "Threshold (1.5s)",
          data: vuCounts.map(() => 1.5),
          borderColor: "rgb(255,0,0)",
          borderWidth: 2,
          borderDash: [10, 5],
          backgroundColor: "rgba(255,0,0,0.05)",
          fill: false,
          pointRadius: 0,
          order: 0,
        },
      ],
    },
    options: {
      ...chartConfig.options,
      plugins: {
        ...chartConfig.options.plugins,
        title: {
          ...chartConfig.options.plugins.title,
          text: "HTTP Request Duration Statistics",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Virtual Users (VUs)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Duration (seconds)",
          },
        },
      },
    },
  };

  // Chart 2: HTTP Request Duration - Percentiles
  const chart2 = {
    ...chartConfig,
    data: {
      labels: vuCounts,
      datasets: [
        {
          label: "p(90)",
          data: durationP90,
          borderColor: "rgb(255, 159, 64)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "p(95)",
          data: durationP95,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "Threshold (1.5s)",
          data: vuCounts.map(() => 2.0),
          borderColor: "rgb(255, 0, 0)",
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...chartConfig.options,
      plugins: {
        ...chartConfig.options.plugins,
        title: {
          ...chartConfig.options.plugins.title,
          text: "HTTP Request Duration Percentiles",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Virtual Users (VUs)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Duration (seconds)",
          },
        },
      },
    },
  };

  // Chart 3: HTTP Request Failed Rate
  const chart3 = {
    ...chartConfig,
    data: {
      labels: vuCounts,
      datasets: [
        {
          label: "Failed Rate",
          data: failedRate,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
        {
          label: "Threshold (1%)",
          data: vuCounts.map(() => 5.0),
          borderColor: "rgb(255, 0, 0)",
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...chartConfig.options,
      plugins: {
        ...chartConfig.options.plugins,
        title: {
          ...chartConfig.options.plugins.title,
          text: "HTTP Request Failed Rate",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Virtual Users (VUs)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Failed Rate (%)",
          },
        },
      },
    },
  };

  // Chart 4: HTTP Requests Count
  const chart4 = {
    ...chartConfig,
    data: {
      labels: vuCounts,
      datasets: [
        {
          label: "Total Requests",
          data: reqsCount,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          pointRadius: 5,
        },
      ],
    },
    options: {
      ...chartConfig.options,
      plugins: {
        ...chartConfig.options.plugins,
        title: {
          ...chartConfig.options.plugins.title,
          text: "Total HTTP Requests",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Virtual Users (VUs)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Requests",
          },
        },
      },
    },
  };

  // Create a composite image with all 4 charts
  // Since chartjs-node-canvas creates single charts, we'll create separate images and combine them

  // Create interactive HTML report with Chart.js
  createInteractiveHTML(
    resultsDict,
    vuCounts,
    durationAvg,
    durationMin,
    durationMed,
    durationMax,
    durationP90,
    durationP95,
    failedRate,
    reqsCount,
    outputDir,
    baseName
  );

  Promise.all([
    chartJSNodeCanvas.renderToBuffer(chart1),
    chartJSNodeCanvas.renderToBuffer(chart2),
    chartJSNodeCanvas.renderToBuffer(chart3),
    chartJSNodeCanvas.renderToBuffer(chart4),
  ])
    .then((buffers) => {
      // Save individual chart images
      buffers.forEach((buffer, index) => {
        const chartNames = [
          "duration_stats",
          "duration_percentiles",
          "failed_rate",
          "total_requests",
        ];
        const chartPath = path.join(
          outputDir,
          `${baseName}_${chartNames[index]}.png`
        );
        fs.writeFileSync(chartPath, buffer);
        console.log(`✓ Chart saved: ${chartPath}`);
      });

      // Also create a static HTML report with all charts side by side
      const staticHtmlPath = path.join(outputDir, `${baseName}_static.html`);
      const staticHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Profile Load Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
      text-align: center;
    }
    .charts-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }
    .chart-wrapper {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .chart-wrapper img {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <h1>Profile Load Test Results - HTTP Metrics vs VU Count</h1>
  <div class="charts-container">
    <div class="chart-wrapper">
      <img src="${path.basename(
        `${baseName}_duration_stats.png`
      )}" alt="Duration Statistics" />
    </div>
    <div class="chart-wrapper">
      <img src="${path.basename(
        `${baseName}_duration_percentiles.png`
      )}" alt="Duration Percentiles" />
    </div>
    <div class="chart-wrapper">
      <img src="${path.basename(
        `${baseName}_failed_rate.png`
      )}" alt="Failed Rate" />
    </div>
    <div class="chart-wrapper">
      <img src="${path.basename(
        `${baseName}_total_requests.png`
      )}" alt="Total Requests" />
    </div>
  </div>
</body>
</html>
    `;
      fs.writeFileSync(staticHtmlPath, staticHtmlContent);
      console.log(`✓ Static HTML report saved: ${staticHtmlPath}`);
      console.log(`✓ Visualization complete!`);
    })
    .catch((error) => {
      console.error("Error generating charts:", error);
      process.exit(1);
    });
}

function findJsonFilesInFolder(folderPath) {
  const resolvedPath = path.resolve(folderPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Folder not found: ${folderPath}`);
    return [];
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    console.error(`Error: Path is not a directory: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(resolvedPath);
  const jsonFiles = files
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .map((file) => path.join(resolvedPath, file));

  return jsonFiles;
}

function main() {
  if (process.argv.length < 3) {
    console.error(
      "Usage: visualize_results.js <folder_path> | <json_file1> [json_file2] [json_file3] ..."
    );
    console.error(
      "  - If a folder path is provided, all JSON files in that folder will be processed"
    );
    console.error("  - Otherwise, provide individual JSON file paths");
    process.exit(1);
  }

  const resultsDict = {};
  let jsonFiles = [];
  let resultsDir = null;

  // Check if first argument is a folder
  const firstArg = process.argv[2];
  const firstArgPath = path.resolve(firstArg);

  if (fs.existsSync(firstArgPath)) {
    const stats = fs.statSync(firstArgPath);
    if (stats.isDirectory()) {
      // It's a folder - find all JSON files in it
      console.log(`Processing folder: ${firstArg}`);
      jsonFiles = findJsonFilesInFolder(firstArgPath);

      if (jsonFiles.length === 0) {
        console.error(`Error: No JSON files found in folder: ${firstArg}`);
        process.exit(1);
      }

      console.log(`Found ${jsonFiles.length} JSON file(s) in folder`);
      resultsDir = firstArgPath;
    } else {
      // It's a file - process individual files
      jsonFiles = process.argv.slice(2).map((file) => path.resolve(file));
    }
  } else {
    // Path doesn't exist - try as individual files
    jsonFiles = process.argv.slice(2).map((file) => path.resolve(file));
  }

  // Parse each JSON file
  for (const jsonPath of jsonFiles) {
    if (!fs.existsSync(jsonPath)) {
      console.warn(`Warning: File not found: ${jsonPath}`);
      continue;
    }

    // Use the directory of the first valid JSON file as output directory
    if (resultsDir === null) {
      resultsDir = path.dirname(jsonPath);
      // Ensure the directory exists
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
    }

    // Extract VU count from filename (e.g., result_50vu.json -> 50)
    const filename = path.basename(jsonPath, path.extname(jsonPath));
    let vuMatch = null;

    for (const part of filename.split("_")) {
      if (part.toLowerCase().includes("vu")) {
        vuMatch = part.toLowerCase().replace("vu", "");
        break;
      }
    }

    if (!vuMatch) {
      console.warn(
        `Warning: Could not extract VU count from filename: ${path.basename(
          jsonPath
        )}`
      );
      continue;
    }

    const vuCount = vuMatch;
    const result = parseK6Json(jsonPath);

    if (result) {
      resultsDict[vuCount] = result;
    }
  }

  if (Object.keys(resultsDict).length === 0) {
    console.error("Error: No valid results found");
    process.exit(1);
  }

  if (resultsDir === null) {
    console.error("Error: No valid JSON files found");
    process.exit(1);
  }

  // Create visualization
  const outputPath = path.join(resultsDir, "profile_test_metrics.png");
  createPlots(resultsDict, outputPath);
}

if (require.main === module) {
  main();
}
