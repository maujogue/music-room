import { getSession } from '@/services/session'

export async function addItemToPlaylist(playlistId: string, uris: string[]) {
	const baseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/playlists/${playlistId}/tracks`;
	const body = {
		'uris': uris,
	};

	const session = await getSession();
	const token = session?.access_token;

	const body_json = JSON.stringify(body);
	console.log('POST body:', body_json);
	const data = await fetch(`${baseUrl}`, {
		method: 'POST',
		body: body_json,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then(res => {
		if (!res.ok) {
			throw new Error('Response not ok');
		}
		return res.json();
	}).catch(err => {
		console.error('Error adding new items to playlist:', err);
	});
	return data
}
