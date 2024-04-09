import { OPENAI_API_KEY } from '$env/static/private';

export async function load({ params }) {
	return {
		token: OPENAI_API_KEY
	};
}
