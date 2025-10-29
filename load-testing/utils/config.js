/**
 * Centralized configuration for load testing
 */

export const loadTestConfig = {
  vus: 50,
  bearerTokens: 10,
  duration: "20s",
  requestDelay: 0.5,
  password: "testpassword123",
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    "http_req_duration{name:profile_fetch}": ["p(95)<1500"], // Profile fetches should be below 1.5s
    "http_req_duration{name:login}": ["p(95)<1000"], // Login should be below 1s
    http_req_failed: ["rate<0.05"], // Allow up to 5% failure rate (rate limits)
  },
};

/**
 * Get test user emails based on VU count
 * @returns {Array<string>} Array of test user emails
 */
export function getTestUserEmails() {
  return Array.from(
    { length: loadTestConfig.vus },
    (_, i) => `testuser${i + 1}@example.com`
  );
}
