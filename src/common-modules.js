module.exports = {
	fitCanvas: canvas => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	},

	clearCanvas: (ctx, canvas) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	drawAllCachedImages: (ctx, state) => {
		for (const [filename, opts] of Object.entries(state)) {
			const {x, y, image} = opts;

			ctx.drawImage(image, x, y);
		}
	}
};