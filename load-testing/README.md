# Load Testing with k6

This directory contains comprehensive load testing scripts for the Music Room application, designed to test individual endpoints and determine concurrent user capacity.

## Setup

1. Install k6: https://k6.io/docs/getting-started/installation/
2. Set environment variables or populate a .env file at load-testing root:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_KEY="your-anon-key"
   ```
3. Install visualization dependencies:
   ```bash
   cd load-testing
   npm install
   ```

## Folder Structure

```
load-testing/
├── scripts/           # Individual endpoint test scripts
├── functions/         # Supabase Edge Functions for testing
├── utils/            # Configuration and utility functions
├── reports/          # Generated HTML reports
├── temp/             # Temporary test results (JSON files)
├── run_k6_test.sh    # Main test runner script
├── visualize_results.js # Results visualization generator
└── max-load.md       # Comprehensive load testing analysis
```

## Available Test Scripts

### Individual Endpoint Tests

- `event_create.js` - Test event creation performance
- `event_read.js` - Test event fetching performance
- `playlist_create.js` - Test playlist creation performance
- `profile_fetch.js` - Test profile retrieval performance
- `profile_update.js` - Test profile update performance
- `me_events.js` - Test user events fetching performance
- `me_playlists.js` - Test user playlists fetching performance
- `mixed_workload.js` - Test realistic user behavior patterns

## Running Tests

### Quick Test (Single Endpoint)

Test a specific endpoint with multiple VU counts:

```bash
./run_k6_test.sh <script_name> <vu_count1> <vu_count2> <vu_count3> ...
```

**Examples:**

```bash
# Test profile fetching with 25, 50, 75, 100 VUs
./run_k6_test.sh profile_fetch 25 50 75 100

# Test event creation with 50, 100, 150 VUs
./run_k6_test.sh event_create 50 100 150

# Test mixed workload with 25, 50, 100, 150 VUs
./run_k6_test.sh mixed_workload 25 50 100 150
```

### Visualize Existing Results

Generate HTML reports from existing test data:

```bash
./run_k6_test.sh --visualize temp/event_create_2025-10-30_13-21-59
```

## Test Outputs

### 1. Console Output

Real-time metrics during test execution:

- Response times (avg, min, max, p90, p95)
- Request counts and throughput
- Error rates and failure counts
- VU utilization

### 2. JSON Results

Detailed metrics saved to `temp/<test_name>_<timestamp>/`:

- `result_<vu>vu.json` - Complete metrics for each VU level
- Includes HTTP request details, timing data, and error information

### 3. HTML Reports

Interactive visualizations saved to `reports/`:

- **Response Time Charts**: Average, median, min/max, percentiles
- **Error Rate Analysis**: Failed request percentages
- **Throughput Metrics**: Total requests and request rates
- **Interactive Controls**: Adjustable thresholds and data filtering

## Configuration

All test parameters are centralized in `utils/config.js`:

```javascript
// Test configuration
const config = {
  // API endpoints
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,

  // Test duration and iterations
  testDuration: "30s",
  iterations: 100,

  // Performance thresholds
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95th percentile < 2s
    http_req_failed: ["rate<0.05"], // Error rate < 5%
  },
};
```

## Understanding Results

### Performance Metrics

- **Response Time**: Time from request start to response completion

  - Average: Mean response time across all requests
  - Median: 50th percentile response time
  - P90: 90th percentile (90% of requests faster than this)
  - P95: 95th percentile (95% of requests faster than this)
  - Min/Max: Fastest and slowest response times

- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second (RPS)
- **VU Utilization**: How effectively virtual users are utilized

### Performance Thresholds

Tests use these default thresholds (configurable):

- **Response Time P95 < 2 seconds**
- **Error Rate < 5%**
- **Individual endpoint thresholds** (e.g., profile fetch < 1.5s)

When thresholds are exceeded, the test reports failures.

## Test Scenarios

### 1. Individual Endpoint Testing

Test specific API endpoints in isolation to identify bottlenecks:

```bash
./run_k6_test.sh profile_fetch 25 50 75 100 150
```

### 2. Mixed Workload Testing

Simulate realistic user behavior with multiple endpoint calls:

```bash
./run_k6_test.sh mixed_workload 25 50 100 150
```

### 3. Stress Testing

Push endpoints to their limits to find breaking points:

```bash
./run_k6_test.sh event_create 200 300 400 500
```

### Debug Mode

Enable detailed logging:

```bash
K6_LOG_LEVEL=debug ./run_k6_test.sh profile_fetch 25 50
```

## Files Reference

- `utils/config.js` - Centralized configuration
- `utils/setup_bearer_tokens.js` - Token management utilities
- `run_k6_test.sh` - Main test runner with visualization
- `visualize_results.js` - HTML report generator
- `scripts/*.js` - Individual endpoint test scripts
- `functions/*.js` - Supabase Edge Functions for testing

---

## Load Testing Analysis Summary

Based on comprehensive load testing across all Music Room endpoints, here are the key findings:

### **Concurrent User Capacity Recommendations**

- **Conservative Production Limit**: **50-75 concurrent users**

  - Response Time: <2 seconds average
  - Failure Rate: <1%
  - Recommended for: Production launch, MVP phase

- **Moderate Growth Limit**: **75-100 concurrent users**

  - Response Time: 1-3 seconds average
  - Failure Rate: 0-5% depending on endpoint
  - Recommended for: Growth phase with monitoring

### **Critical Performance Issues**

1. **User Events Endpoint** - Response times >10 seconds at 100 VUs (immediate optimization required)
2. **Profile Fetch** - 13.7% failure rate at 150 VUs
3. **User Playlists** - 10.5% failure rate at 100 VUs

### **Well-Performing Endpoints**

- Event Create: Maintains good performance up to 150 VUs
- Event Read: Stable performance up to 100 VUs
- Playlist Create: Consistent performance across all tested VU levels
- Profile Update: Good performance up to 100 VUs

