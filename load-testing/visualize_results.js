#!/usr/bin/env node
/**
 * Parse k6 JSON results and create visualizations showing HTTP metrics vs VU count
 */

const fs = require("fs");
const path = require("path");

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
  baseName,
  reportsDir,
  reportFileName
) {
  // Save HTML report to reports folder with folder name format
  const htmlPath = path.join(reportsDir, reportFileName);

  // Extract test name from folder name for title
  const folderName = path.basename(outputDir);
  const testTitle = folderName
    .split("_")
    .slice(0, -2)
    .join("_")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

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
  <title>${testTitle} Load Test Results - Interactive</title>
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
    <h1>${testTitle} Load Test Results - HTTP Metrics vs VU Count</h1>
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
  // Use simple base name without route prefix (route is in folder name)
  const baseName = "metrics";

  // Extract folder name to create report filename (e.g., "event_create_2025-10-29_16-02-30")
  const folderName = path.basename(outputDir);
  const reportFileName = `${folderName}.html`;

  // Determine reports directory (parent of temp folder)
  const loadTestingDir = path.resolve(outputDir, "..", "..");
  const reportsDir = path.join(loadTestingDir, "reports");

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

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
    baseName,
    reportsDir,
    reportFileName
  );

  console.log(`✓ Visualization complete!`);
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
  // Use a dummy output path for createPlots (it will determine reports dir itself)
  const outputPath = path.join(resultsDir, "dummy");
  createPlots(resultsDict, outputPath);
}

if (require.main === module) {
  main();
}
