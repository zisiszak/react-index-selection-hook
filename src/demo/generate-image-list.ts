const assortedImages: readonly string[] = [
	'https://images.unsplash.com/photo-1755812321862-fc8396cd7961?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756850585212-365a3596e74a?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1757161969591-874937df864b?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756891675732-62eb5872f8e5?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1753998218460-4bbac7c9fc5e?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1754079132758-5dfb65298934?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756814879165-d2eb1606c3c0?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756806983832-1f056cf24182?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756877468830-9fbf44ee34a8?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1755289445810-bfe6381d51c4?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756312812826-28d47367d032?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1755532016921-f4c99febe732?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756474215831-4e5f8309c6bc?q=80&w=300&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1756310331722-31901b1bafc1?q=80&w=300&auto=format&fit=crop',
];

export function generateImageList(count: number) {
	return new Array(count).fill(null).map((_, i) => ({
		imageSrc:
			assortedImages[Math.floor(Math.random() * assortedImages.length)],
	}));
}
