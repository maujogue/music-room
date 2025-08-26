// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("LOCAL_SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SECRET_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const base_url = Deno.env.get("API_BASE_URL") || "http://localhost:54321"
const redirect_uri = `${base_url}/functions/v1/auth/spotify/callback`
const client_id = Deno.env.get("SPOTIFY_CLIENT_ID")!;
const client_secret = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;

Deno.serve(async (req, res) => {
	  const url = req.url;

	if (url.includes("/spotify/callback")) {
		return handleSpotifyCallback(req, res)
	}
	if (url.includes("/spotify")) {
		return handleSpotifyAuth(req, res)
	}

	return new Response(
		"blc",
		{ headers: { "Content-Type": "application/json" } },
	)
})

function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
	result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

async function handleSpotifyAuth(req: Request, res: Response): Response {
	var state = generateRandomString(16);
	var scope = 'user-read-private user-read-email';

	const { error } = await supabase.from("oauth_state").insert([{ state }]);
	if (error) {
		return new Response(`Internal error: ${error.message}`, { status: 500 });
	}

	const params = new URLSearchParams({
	response_type: 'code',
	client_id: client_id,
	scope: scope,
	redirect_uri: redirect_uri,
	state: state
	});

  	const headers = new Headers();
	headers.set("Location", 'https://accounts.spotify.com/authorize?' + params.toString());
	return new Response(null, {
	status: 302,
	headers: headers
	});
}

async function handleSpotifyCallback(req: Request, res: Response): Response {
	const url = new URL(req.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	const { data, error } = await supabase.from("oauth_state").select("*").eq("state", state).single();
	if (error || !data) {
		return new Response("Invalid state", { status: 400 });
	}

	if (!code) {
		return new Response("Missing code", { status: 400 });
	}

	await supabase.from("oauth_state").delete().eq("state", state);

	return await fetchSpotifyUserToken(code);
}

async function fetchSpotifyUserToken(code: string): Promise<Response> {
	const bodyParams = new URLSearchParams();
	bodyParams.append("code", code);
	bodyParams.append("redirect_uri", redirect_uri);
	bodyParams.append("grant_type", "authorization_code");

	const authHeader = "Basic " + btoa(client_id + ":" + client_secret);

	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": authHeader,
		},
		body: bodyParams.toString(),
	});
	if (!response.ok) {
		const errorText = await response.text();
		return new Response("Error fetching token: " + errorText, { status: 500 });
	}

	const json_data = await response.json();

	const user_profile_data = await fetchSpotifyUserProfile(json_data.access_token);

	if (user_profile_data) {
		let user: any;
		let user_id: string;

		if (!await checkIfAuthUserAlreadyExist(user_profile_data.email)) {
			user = await createAuthUser(user_profile_data);
			user_id = user.user.id;
		}
		else {
			user = await supabase.from("users").select("*").eq("email", user_profile_data.email).single().then(res => res.data);
			user_id = user.id;
		}
		await supabase.from("users").upsert({
			id: user_id,
			email: user_profile_data.email,
			spotify_access_token: json_data.access_token,
			spotify_refresh_token: json_data.refresh_token,
			spotify_token_expires_at: json_data.expires_in ? new Date(Date.now() + json_data.expires_in * 1000) : null,
		});
	}


	return new Response(JSON.stringify({ message: "Token received", tokenData: json_data }), {
	status: 200,
	headers: { "Content-Type": "application/json" },
	});
}

async function createAuthUser(userData: any): Promise<any> {
	const spotifyUser = {
		id: userData.id,
		email: userData.email,
		displayName: userData.displayName
	};

	const { data, error } = await supabase.auth.admin.createUser({
		email: spotifyUser.email,
		email_confirm: true,
		password: crypto.randomUUID(),
		user_metadata: {
			spotify_id: spotifyUser.id,
			display_name: spotifyUser.displayName,
		},
	});

	if (error) {
		console.error("Error creating auth user:", error.message);
		return;
	}
	return data;
}

async function checkIfAuthUserAlreadyExist(userEmail: string): Promise<boolean> {
    const { data, error } = await supabase
        .from("users")     // table publique users liée à auth.users
        .select("*")
        .eq("email", userEmail);

    if (error) {
        console.log("Error checking if auth user exists:", error.message);
        return false;
    }

    return data.length !== 0;
}


async function fetchSpotifyUserProfile(access_token: string): Promise<any> {
	const response = await fetch("https://api.spotify.com/v1/me", {
		headers: {
			"Authorization": "Bearer " + access_token
		}
	});
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error("Error fetching user profile: " + errorText);
	}
	return await response.json();
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/auth' \
	--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
	--header 'Content-Type: application/json' \
	--data '{"name":"Functions"}'

*/
