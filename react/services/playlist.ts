import { getSession } from '@/services/session'

export async function getPlaylistById(id: string) {
	const session = await getSession();
	const data = await fetch(
		`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${session?.access_token}`,
			},
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.catch(error => {
			console.error('Error fetching playlist:', error);
			throw error;
		});
	return data;
}

export async function addItemToPlaylist(playlistId: string, uris: string[]) {
	const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/tracks`;
	const body = {
		'uris': uris,
	};

	const session = await getSession();
	const token = session?.access_token;

	const data = await fetch(`${baseUrl}`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then(res => {
		if (!res.ok) {
			throw new Error('Server response with status ' + res.status);
		}
		return res.json();
	}).catch(err => {
		console.error('Error adding new items to playlist:', err);
	});
	return data
}

export async function deleteItemFromPlaylist(playlistId: string, uris: string[]) {
	const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/tracks`;
	const session = await getSession();
	const token = session?.access_token;
	const body = {
		'tracks': uris.map(uri => ({ uri }))
	};

	const data = await fetch(`${baseUrl}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	}).then(res => {
		if (!res.ok) {
			throw new Error('Response not ok');
		}
		return res.json();
	}).catch(err => {
		console.error('Error deleting item from playlist:', err);
	});
	return true
}

export async function deletePlaylistService(id: string) {
	const session = await getSession();

	const response = await fetch(
	`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${id}`,
	{
		method: 'DELETE',
		headers: {
		Authorization: `Bearer ${session?.access_token}`,
		'Content-Type': 'application/json',
		},
	},
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Delete failed (status ${response.status}): ${errorBody}`,
		);
	}
}
