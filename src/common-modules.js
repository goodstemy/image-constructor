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
			const {x, y, image, isActive, width, height} = opts;

			ctx.drawImage(image, x, y);

			if (isActive) {
				module.exports.addBorderToImage(ctx, x - 2, y - 2, width + 4, height + 4);
			}
		}
	},

	addBorderToImage: (ctx, x, y, width, height) => {
		ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
	},
};