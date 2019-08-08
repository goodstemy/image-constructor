const EventListener = require('./event-listener.js');
const {
	fitCanvas,
	clearCanvas,
	drawAllCachedImages,
	addBorderToImage,
} = require('./common-modules.js');

class ImageConstructor {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.state = {};

		this.isMouseDown = false;

		this.activeImage = null;
		this.draggableImage = null;
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
		this._getActiveImage(e.layerX, e.layerY);
	}

	canvasMouseUp(e) {
		this.isMouseDown = this.el.canvasMouseUp(e, this.isMouseDown);

		this._resetDiffs();
		this._resetDraggableImage();
	}

	canvasMouseMove(e) {
		const {layerX, layerY} = e;

		if (!this.isMouseDown) {
			return;
		}

		if (!this._isMouseOnImage(e)) {
			return;
		}

		this._removeBorder();
		this._getDraggableImage(layerX, layerY);

		const {image, width, height, x, y, filename} = this.draggableImage;

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

	canvasClick(e) {
		e.preventDefault();
		
		if (!this._isMouseOnImage(e)) {
			this._removeBorder();
			return;
		}

		this._getActiveImage(e.layerX, e.layerY);
		this._switchBorders(this.activeImage.filename);
	}

	_getActiveImage(layerX, layerY) {
		for (const [filename, opts] of Object.entries(this.state)) {
			const {x, y, width, height, image, isActive} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				this.activeImage = {...opts, filename};
				this.state[filename].isActive = true;
			}
		}
	}

	_getDraggableImage(layerX, layerY) {
		for (const [filename, opts] of Object.entries(this.state)) {
			const {x, y, width, height, image, isActive} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				if (this.draggableImage && filename !== this.activeImage.filename) {
					continue;
				}

				this.draggableImage = {...opts, filename};
				this.state[filename].isActive = true;
			}
		}
	}

	_switchBorders(filename) {
		this._removeBorder();

		this.state[filename].isActive = true;
	}

	_removeBorder() {
		for (const [filename, opts] of Object.entries(this.state)) {
			opts.isActive = false;
		}
	}

	_resetDraggableImage() {
		this.draggableImage = null;
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
				return true;
			}
		}

		return false;
	}

	_isMouseOnAnotherImage({layerX, layerY}, {filename: currentImageFilename}) {
		for (const [filename, opts] of Object.entries(this.state)) {
			const {x, y, width, height, image} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height && filename !== currentImageFilename) {
				return true;
			}
		}

		return false;
	}

	_drawNewImage({image, x, y}) {
		this.ctx.drawImage(image, x, y);
	}

	_addNewImageToState(filename, opts) {
		this.state[filename] = {...opts, isActive: false};
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
		this._draw();

		// TODO: Fix bug - autoclearing canvas. Implement later
		// resizeCanvas(this.canvas);

		requestAnimationFrame(this._servicesRunner.bind(this));
	}

	_draw() {
		clearCanvas(this.ctx, this.canvas);
		drawAllCachedImages(this.ctx, this.state);
	}
}

module.exports = ImageConstructor;
