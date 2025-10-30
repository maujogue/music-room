import { sleep } from "k6";
import http from "k6/http";

const supabaseUrl = __ENV.SUPABASE_URL;
const supabaseKey = __ENV.SUPABASE_KEY;

/**
 * Logs in a user by email and password, returns access token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {{accessToken: string, userId: string}|null} - Access token and user ID, or null on failure
 */
export function loginUser(email, password) {
  const signInResponse = http.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
      },
      tags: { name: "login" },
    }
  );

  if (signInResponse.status !== 200) {
    console.error(
      `Login failed for ${email} - Status ${signInResponse.status} - ${signInResponse.body}`
    );
    return null;
  }

  const authData = JSON.parse(signInResponse.body);
  const access_token = authData.access_token;
  const userId = authData.user?.id;

  if (!access_token) {
    console.error(`No access token received for ${email}`);
    return null;
  }

  return {
    accessToken: access_token,
    userId: userId,
  };
}

export function createUser(vuId) {
  const email = `testuser${vuId}@example.com`;
  const password = "testpassword123";

  const signUpResponse = http.post(
    `${supabaseUrl}/auth/v1/signup`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
      },
    }
  );
  return JSON.parse(signUpResponse.body);
}

export function setup_bearer_tokens(maxVUs, password) {
  const tokenPool = [];
  console.log(`Pre-creating ${maxVUs} bearer tokens...`);

  for (let i = 1; i <= maxVUs; i++) {
    const email = `testuser${i}@example.com`;
    let authResult = loginUser(email, password);

    // If login failed, try creating the user and then login again
    if (!authResult) {
      console.log(`Login failed for ${email}, attempting to create user...`);
      try {
        const createResult = createUser(i);
        // Check if user creation was successful (status 200 or user already exists)
        // Supabase signup API may return user data even if user exists
        if (createResult.user || createResult.id) {
          console.log(`User ${email} created/verified, retrying login...`);
          sleep(0.1); // Small delay after creation to allow DB to sync
          authResult = loginUser(email, password);
        } else {
          // User creation failed, but try login anyway (user might exist)
          console.log(
            `User creation response ambiguous for ${email}, retrying login...`
          );
          sleep(0.1);
          authResult = loginUser(email, password);
        }
      } catch (error) {
        console.error(`Error creating user ${email}: ${error.message}`);
        // Continue to try login anyway (user might already exist)
        sleep(0.1);
        authResult = loginUser(email, password);
      }
    }

    if (authResult) {
      tokenPool.push({
        vuId: i,
        email: email,
        accessToken: authResult.accessToken,
        userId: authResult.userId,
      });
      if (tokenPool.length % 10 === 0) {
        console.log(`Created ${tokenPool.length} tokens...`);
      }
    } else {
      console.error(`Failed to create token for ${email} after retry`);
      // Continue processing other users instead of breaking
      // This allows partial success even if some users fail
    }
    sleep(0.1);
  }

  console.log(`Successfully created ${tokenPool.length}/${maxVUs} tokens`);

  // Return tokens - this will be passed to all VUs
  return { tokenPool: tokenPool };
}
