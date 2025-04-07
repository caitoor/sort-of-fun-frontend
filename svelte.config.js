import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Erzeuge eine Fallback-Datei, die von allen Routen genutzt wird.
			fallback: 'index.html'
		}),
	}
};

export default config;
