const EventListener = require('./event-listener.js');
const {
	fitCanvas,
	clearCanvas,
	drawAllCachedImages,
	addBorderToImage,
	addLayer,
	getOptsOfLayer,
	getLayerByName,
	sortLayersByDOMLayers,
} = require('./common-modules.js');

class ImageConstructor {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.state = {};

		this.layers = [];

		this.isMouseDown = false;

		this.activeImage = null;
		this.draggableImage = null;
		this.lastDiffX = null;
		this.lastDiffY = null;
		this.layersDOM = null;
		this.drake = null;

		this._startServices();

		this.el = new EventListener();

		// only for debug
		// setInterval(() => console.log(this.state), 1000);
	}

	async dispatchAddImage(e, inputImageChooser) {
		const [filename, opts] = await this.el.dispatchAddImage(e, inputImageChooser);

		this._addNewImageToState(filename, opts);
		this._addNewLayer(filename, opts);
		this._updateDragula();
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
		if (!this.isMouseDown) {
			return;
		}

		if (!this._isMouseOnImage(e)) {
			return;
		}

		const {layerX, layerY} = e;

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

	setLayers(layers) {
		this.layersDOM = layers;
	}

	_addNewLayer(filename, {image}) {
		addLayer(this.layersDOM, filename, image.src);

		this.layers.push(filename);
	}

	_getActiveImage(layerX, layerY) {
		for (let i = 0; i < this.layers.length; i++) {
			const filename = this.layers[i];
			const opts = this.state[filename];
			const {x, y, width, height, image, isActive} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				this.activeImage = {...opts, filename};
				this.state[filename].isActive = true;
			}
		}
	}

	_getDraggableImage(layerX, layerY) {
		for (let i = 0; i < this.layers.length; i++) {
			const filename = this.layers[i];
			const opts = this.state[filename];
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

	_resetDraggableLayer() {
		this.draggableLayer = null;
	}

	_resetDiffs() {
		this._setDiffs({});
	}

	_setDiffs({lastDiffX = null, lastDiffY = null}) {
		this.lastDiffX = lastDiffX;
		this.lastDiffY = lastDiffY;
	}

	_isMouseOnImage({layerX, layerY}) {
		for (let i = 0; i < this.layers.length; i++) {
			const filename = this.layers[i];
			const opts = this.state[filename];
			const {x, y, width, height, image, isActive} = opts;

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

	_updateDragula() {
		if (this.drake) {
			this.drake.destroy();
		}

		this.drake = dragula([this.layersDOM], {
			direction: 'horizontal'
		});

		this.drake.on('dragend', () => this._updateLayers());
	}

	_updateLayers() {
		this.layers = sortLayersByDOMLayers(this.layersDOM);
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
		fitCanvas(this.canvas);

		this._draw();

		requestAnimationFrame(this._servicesRunner.bind(this));
	}

	_draw() {
		clearCanvas(this.ctx, this.canvas);
		drawAllCachedImages(this.ctx, this.layers, this.state);
	}
}

module.exports = ImageConstructor;
