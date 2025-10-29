# Load Testing with k6

This directory contains k6 scripts for load testing the music-room application.

## Setup

1. Install k6: https://k6.io/docs/getting-started/installation/
2. Set environment variables:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_KEY="your-anon-key"
   ```

## Configuration

All load test parameters are centralized in `utils/config.js`.

## Running Tests

### 1. Create Test Users

First, create the test users that will be used for load testing:

```bash
k6 run functions/setup_test_users.js
```

This will create all users needed for capacity testing (default: 100, configurable in `config.js` via `capacityTest.maxVUs`).

### 2. Capacity Test (Find Maximum Concurrent Users)

**This is the test you want for finding capacity!**

The capacity test pre-creates all bearer tokens before running to avoid rate limiting.

**Step 1: Create users for capacity test**

```bash
k6 run functions/setup_test_users.js
```

This creates all users needed (up to maxVUs configured in `config.js`, default: 100).

**Step 2: Run the capacity test**

```bash
k6 run functions/capacity_test.js
```

The test will:

- **Pre-create all bearer tokens** (once, before the test starts - shown in console)
- Start with 5 VUs
- Increase by 5 VUs every 20 seconds
- Continue until thresholds fail or max VUs (100) is reached
- **Fail when performance degrades below your thresholds**
- Each VU uses a pre-created token (no login during test = no rate limiting!)

Look at the output to see which VU count caused the failure. The last successful stage indicates your maximum capacity.

## Understanding Capacity Test Results

When the capacity test runs, k6 will report:

```
✓ Check: http_req_duration...: p(95)=1500ms < 2000ms
✓ Check: http_req_failed...: rate=0.02 < 0.05

... (continues until failure)

✗ Check: http_req_duration...: p(95)=2100ms > 2000ms
```

**The VU count at the stage BEFORE failure is your maximum capacity.**

For example, if it fails at 50 VUs, your app can handle **45 concurrent users** before performance degrades.

## Customizing Capacity Test

Edit `utils/config.js` to adjust capacity test parameters:

```javascript
capacityTest: {
  startVUs: 5,        // Starting number of VUs
  maxVUs: 100,       // Maximum VUs to test up to
  vuIncrement: 5,    // Increase by this many VUs per stage
  stageDuration: "30s",  // How long to run at each VU level
  rampUpDuration: "10s", // Initial ramp-up time
}
```

### Example: More Granular Test

To find capacity more precisely (smaller increments):

```javascript
capacityTest: {
  startVUs: 10,
  maxVUs: 100,
  vuIncrement: 2,    // Increase by 2 instead of 5
  stageDuration: "20s",  // Shorter stages
  rampUpDuration: "5s",
}
```

### Example: Test Higher Capacity

To test up to 500 concurrent users:

```javascript
capacityTest: {
  startVUs: 10,
  maxVUs: 500,       // Test up to 500 VUs
  vuIncrement: 10,   // Increase by 10 per stage
  stageDuration: "30s",
  rampUpDuration: "10s",
}
```

## Performance Thresholds

The capacity test uses these thresholds (configurable in `config.js`):

- **Overall p95 latency < 2s**
- **Profile fetches p95 < 1.5s**
- **Login p95 < 1s**
- **Error rate < 5%**

When any threshold is exceeded, the test fails.

## Dealing with Rate Limiting

The load tests use token caching to avoid rate limiting:

- Tokens are cached per VU
- Login only happens once per VU (first iteration)
- Subsequent iterations reuse cached tokens

If you still hit rate limits:

1. Reduce `vuIncrement` in capacity test config
2. Increase `stageDuration` to spread requests over time
3. Test during off-peak hours

## Files

- `utils/config.js` - **Centralized configuration** for all load tests
- `utils/create_vu.js` - Utility functions for creating users
- `utils/login_vu.js` - Utility functions for logging in users
- `functions/setup_test_users.js` - Script to create test users
- `functions/capacity_test.js` - **Capacity test that finds max concurrent users**

## Example Output

### Capacity Test Success (within limits)

```
✓ Check: http_req_duration...: p(95)=1200ms < 2000ms (at 30 VUs)
✓ Check: http_req_duration...: p(95)=1800ms < 2000ms (at 45 VUs)
✗ Check: http_req_duration...: p(95)=2100ms > 2000ms (at 50 VUs) ← FAILED

Result: Maximum capacity is 45 concurrent users
```

### Capacity Test - All Stages Pass

```
✓ All thresholds passed up to 100 VUs
Result: Application can handle at least 100 concurrent users
```

### Batch Capacity Testing (Compare Multiple Configurations)

To test multiple maxVUs values and compare results, use the batch testing script:

```bash
cd load-testing
./run_batch_capacity_tests.sh
```

This will:

- Run capacity tests for maxVUs values: 50, 100, and 150 (configurable in the script)
- Save individual result files to `load-testing/results/`
- Generate a comparison table in the console
- Create an interactive HTML report at `load-testing/results/comparison_report.html`

The HTML report includes:

- **Capacity comparison chart**: Shows last successful concurrent users for each configuration
- **Response time charts**: Compares profile fetch and overall p95 latencies
- **Error rate visualization**: Shows error rates across different maxVUs
- **Detailed results table**: Complete metrics for all test runs

**Customizing maxVUs values:**

Edit `load-testing/run_batch_capacity_tests.sh` and modify the `MAX_VUS_VALUES` array:

```bash
MAX_VUS_VALUES=(25 50 75 100 125 150)
```

**Viewing results:**

1. **Console output**: See summary comparison immediately after tests complete
2. **HTML report**: Open `load-testing/results/comparison_report.html` in your browser
3. **Individual JSON files**: Each test creates `result_max<value>.json` with detailed metrics

### Fixed Load Comparison (Response Time & Success Rate Analysis)

To compare how response times and success rates change with different concurrent user counts, use the fixed load comparison:

```bash
cd load-testing
./run_fixed_load_comparison.sh
```

This will:

- Run tests with **same total requests** (1000 by default) and **different VU counts** (50, 100, 150)
- Ensure fair comparison: same workload, different concurrency levels
- Generate charts showing:
  - **Response times (p95) with threshold lines** - Shows how latency increases with more concurrent users
  - **Success rate vs Error rate** - Shows how error rates increase under higher load
  - **Average response time trends** - Shows overall performance degradation

**Key insights from this test:**

- As VU count increases, you'll see response times increase (lines trending up)
- Error rates typically increase with more concurrent users
- Threshold violations become visible on the charts (red dashed lines show limits)

**Customizing test parameters:**

Edit `load-testing/run_fixed_load_comparison.sh` to change:

```bash
VU_COUNTS=(25 50 75 100)  # Different VU counts to test
```

Edit `load-testing/utils/config.js` to change:

```javascript
targetTotalRequests: 2000,  // Total requests for all tests
```

**Results:**

- Console comparison table with response times and success rates
- Interactive HTML report at `load-testing/results/fixed_load_comparison.html`
- Individual JSON files: `result_fixed_<vu>vu.json`

## Tips

1. **Run capacity test multiple times** to ensure consistent results
2. **Monitor your Supabase dashboard** during the test to see actual load
3. **Check for rate limiting** - if failures happen early, it might be rate limits, not capacity
4. **Adjust thresholds** based on your application's requirements
5. **Test incrementally** - start with lower maxVUs and increase if needed
6. **Use batch testing** to compare performance across different configurations
