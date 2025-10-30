#!/bin/bash

# Run any k6 load test script with different VU counts and generate visualizations
# Usage: ./run_k6_test.sh <script_name> [vu_count1] [vu_count2] [vu_count3] ...
#        ./run_k6_test.sh --visualize <folder_path>
# Example: ./run_k6_test.sh profile 25 50 75 100 125 150
# Example: ./run_k6_test.sh event_create 50 100 150
# Example: ./run_k6_test.sh --visualize results/run_2025-10-29_13-56-27

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${SCRIPT_DIR}/scripts"
RESULTS_BASE_DIR="${SCRIPT_DIR}/results"

# Check if any arguments provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <script_name> [vu_count1] [vu_count2] [vu_count3] ..."
    echo "        $0 --visualize <folder_path>"
    echo "Example: $0 profile 25 50 75 100 125 150"
    echo "Example: $0 event_create 50 100 150"
    echo "Example: $0 --visualize results/run_2025-10-29_13-56-27"
    exit 1
fi

# Check if --visualize flag is used
if [ "$1" = "--visualize" ] || [ "$1" = "-v" ]; then
    if [ $# -lt 2 ]; then
        echo "Error: Folder path required for --visualize option"
        echo "Usage: $0 --visualize <folder_path>"
        exit 1
    fi

    FOLDER_PATH="${2}"
    if [ ! -d "${FOLDER_PATH}" ]; then
        echo "Error: Folder not found: ${FOLDER_PATH}"
        exit 1
    fi

    echo "Visualizing results from folder: ${FOLDER_PATH}"
    echo ""

    # Check if node_modules exists, if not install dependencies
    if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
        echo "Installing visualization dependencies..."
        cd "${SCRIPT_DIR}"
        npm install
    fi

    # Run visualization script with folder path
    node "${SCRIPT_DIR}/visualize_results.js" "${FOLDER_PATH}"

    echo ""
    echo "Visualization complete!"
    exit 0
fi

# Get script name from first argument
SCRIPT_NAME="${1}"
K6_SCRIPT="${SCRIPTS_DIR}/${SCRIPT_NAME}.js"

# Validate script exists
if [ ! -f "${K6_SCRIPT}" ]; then
    echo "Error: Script not found: ${K6_SCRIPT}"
    echo "Available scripts in ${SCRIPTS_DIR}:"
    ls -1 "${SCRIPTS_DIR}"/*.js 2>/dev/null | sed "s|${SCRIPTS_DIR}/||" | sed "s|\.js$||" || echo "  (none found)"
    exit 1
fi

# Extract script name without extension for dynamic naming
SCRIPT_BASENAME="${SCRIPT_NAME}"

# Get remaining arguments (VU counts)
shift
VU_COUNTS=("$@")

# Check if any VU counts provided
if [ ${#VU_COUNTS[@]} -eq 0 ]; then
    echo "Error: At least one VU count required"
    echo "Usage: $0 <script_name> [vu_count1] [vu_count2] [vu_count3] ..."
    echo "Example: $0 profile 25 50 75 100"
    exit 1
fi

# Create timestamped results directory for this run
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RESULTS_DIR="${RESULTS_BASE_DIR}/${SCRIPT_BASENAME}_${TIMESTAMP}"
mkdir -p "${RESULTS_DIR}"

echo "Running ${SCRIPT_BASENAME} load test with VU counts: ${VU_COUNTS[*]}"
echo "Results will be saved to: ${RESULTS_DIR}"
echo ""

# Array to store JSON result file paths
declare -a json_files

# Loop through each VU count argument
for vu_count in "${VU_COUNTS[@]}"; do
    # Validate that the argument is a number
    if ! [[ "$vu_count" =~ ^[0-9]+$ ]]; then
        echo "Warning: '$vu_count' is not a valid number, skipping..."
        continue
    fi
    
    json_file="${RESULTS_DIR}/result_${vu_count}vu.json"
    
    echo "=== Running with ${vu_count} VUs ==="
    K6_VUS="${vu_count}" k6 run --vus "${vu_count}" --out json="${json_file}" "${K6_SCRIPT}"
    
    # Check if the test ran successfully
    if [ -f "${json_file}" ]; then
        json_files+=("${json_file}")
        echo "✓ Results saved to ${json_file}"
    else
        echo "⚠ Warning: Results file not created for ${vu_count} VUs"
    fi
    
    echo ""
done

# Check if we have any valid results
if [ ${#json_files[@]} -eq 0 ]; then
    echo "Error: No valid test results to visualize"
    exit 1
fi

echo "Generating visualizations..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
    echo "Installing visualization dependencies..."
    cd "${SCRIPT_DIR}"
    npm install
fi

# Run visualization script with all JSON files
echo "Visualizing results from ${#json_files[@]} test run(s)..."
node "${SCRIPT_DIR}/visualize_results.js" "${json_files[@]}"

echo ""
echo "All load tests completed!"
echo "Results saved in: ${RESULTS_DIR}"
open "${RESULTS_DIR}/report.html"