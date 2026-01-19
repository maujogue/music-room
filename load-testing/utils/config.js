/**
 * Centralized configuration for load testing
 */

export const loadTestConfig = {
  vus: 50,
  bearerTokens: 10,
  duration: "20s",
  requestDelay: 0.5,
  password: "testpassword123",
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
