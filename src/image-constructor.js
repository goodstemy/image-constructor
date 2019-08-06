const EventListener = require('./event-listener.js');
const {
	fitCanvas,
	clearCanvas,
	drawAllCachedImages,
} = require('./common-modules.js');

class ImageConstructor {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.state = {};

		this.isMouseDown = false;

		this.choosedImage = null;
		this.lastDiffX = null;
		this.lastDiffY = null;

		this._startServices();

		this.el = new EventListener();

		fitCanvas(this.canvas);

		// only for debug
		setInterval(() => console.log(this.state), 1000);
	}

	async dispatchAddImage(e, inputImageChooser) {
		const [filename, opts] = await this.el.dispatchAddImage(e, inputImageChooser);

		this._drawNewImage(opts);
		this._addNewImageToState(filename, opts);
	}

	canvasMouseDown(e) {
		this.isMouseDown = this.el.canvasMouseDown(e, this.isMouseDown);
	}

	canvasMouseUp(e) {
		this.isMouseDown = this.el.canvasMouseUp(e, this.isMouseDown);

		this._resetDiffs();
		this._resetChoosedImage();
	}

	canvasMouseMove(e) {
		const {layerX, layerY} = e;

		if (this.isMouseDown && this._isMouseOnImage(e) && this.choosedImage) {
			clearCanvas(this.ctx, this.canvas);
			drawAllCachedImages(this.ctx, this.state);

			const {image, width, height, x, y, filename} = this.choosedImage;

			if (this.lastDiffX === null && this.lastDiffY === null) {
				this._setDiffs({
					lastDiffX: layerX - x,
					lastDiffY: layerY - y,
				});
			}

			this._drawNewImage({
				image, 
				x: layerX - this.lastDiffX, 
				y: layerY - this.lastDiffY
			});

			this.state[filename].x = layerX - this.lastDiffX;
			this.state[filename].y = layerY - this.lastDiffY;
		}
	}

	_resetChoosedImage() {
		this.choosedImage = null;
	}

	_resetDiffs() {
		this._setDiffs({});
	}

	_setDiffs({lastDiffX = null, lastDiffY = null}) {
		this.lastDiffX = lastDiffX;
		this.lastDiffY = lastDiffY;
	}

	_isMouseOnImage({layerX, layerY}) {
		for (const [filename, opts] of Object.entries(this.state)) {
			const {x, y, width, height, image} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				if (!this.choosedImage) {
					this.choosedImage = {...opts, filename};
				}

				return true;
			}
		}

		return false;
	}

	_drawNewImage({image, x, y}) {
		this.ctx.drawImage(image, x, y);
	}

	_addNewImageToState(filename, opts) {
		this.state[filename] = opts;
	}

	_startServices() {
		const requestAnimationFrame = 
				 window.requestAnimationFrame 
			|| window.mozRequestAnimationFrame 
			|| window.webkitRequestAnimationFrame 
			|| window.msRequestAnimationFrame;

		window.requestAnimationFrame = requestAnimationFrame;

		requestAnimationFrame(this._servicesRunner.bind(this));
	}

	_servicesRunner() {
		// TODO: Fix bug - autoclearing canvas. Implement later
		// resizeCanvas(this.canvas);

		requestAnimationFrame(this._servicesRunner.bind(this));
	}
}

module.exports = ImageConstructor;
