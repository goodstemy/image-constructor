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
	updateOpacityRangeValue,
	updateSettingsTitle,
} = require('./common-modules.js');
const {
	RESIZE_FIELD_RANGE,
	RESIZE_TYPES,
} = require('./constants.js');

class ImageConstructor {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.state = {};
		this.resizeState = {};

		this.layers = [];

		this.isMouseDown = false;

		this.activeImage = null;
		this.draggableImage = null;
		this.lastDiffX = null;
		this.lastDiffY = null;
		this.layersDOM = null;
		this.drake = null;
		this.resizeType = null;
		this.cursor = 'default';

		this._startServices();

		this.el = new EventListener();

		// only for debug
		// setInterval(() => console.log(this.state), 1000);
	}

	async dispatchAddImage(e, inputImageChooser) {
		const [filename, opts] = await this.el.dispatchAddImage(e, inputImageChooser);

		this._updateResizeCorners(opts);
		this._addNewImageToState(filename, opts);
		this._addNewLayer(filename, opts);
		this._updateDragula();
	}

	canvasMouseDown(e) {
		this.isMouseDown = this.el.canvasMouseDown(e, this.isMouseDown);

		this._getActiveImage(e.layerX, e.layerY);
		this._updateOpacityRange();
		this._updateSettingsTitle();
	}

	canvasMouseUp(e) {
		this.isMouseDown = this.el.canvasMouseUp(e, this.isMouseDown);

		this._resetDiffs();
		this._resetDraggableImage();
		this._resetResizeState();
		this._dropCursor();
	}

	canvasMouseMove(e) {
		if (!this._isMouseOnImage(e)) {
			return;
		}

		const {layerX, layerY} = e;

		this._getDraggableImage(layerX, layerY);

		if (!this.draggableImage) {
			return;
		}

		if (this._isMouseNearCorners(layerX, layerY)) {
			this._setResizeCursor();
			this._resizeImage(layerX, layerY);

			return;
		}

		this._dropCursor();

		if (!this.isMouseDown) {
			return;
		}

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

		this._updateResizeCorners(this.state[filename]);
	}

	canvasClick(e) {
		e.preventDefault();
		
		if (!this._isMouseOnImage(e)) {
			this._resetActiveImage();
			this._removeBorder();
			this._updateSettingsTitle();

			return;
		}

		this._getActiveImage(e.layerX, e.layerY);
		this._switchBorders(this.activeImage.filename);
		this._updateOpacityRange();
		this._updateSettingsTitle();
	}

	changeOpacity(e) {
		const value = this.el.getValueFromRangeInput(e);
		const {filename} = this.activeImage;

		this.state[filename].opacity = value;
	}

	exportImage(e) {
		const image = canvas.toDataURL("image/png", 1.0);
	  const link = document.createElement('a');

	  link.download = "my-image.png";
	  link.href = image;
	  link.click();
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
				if (!this.activeImage || this.draggableImage && filename !== this.activeImage.filename) {
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

	_resetActiveImage() {
		this.activeImage = null;
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

	_isMouseNearCorners(layerX, layerY) {
		const {corners} = this.draggableImage;

		if (
			layerX >= corners.leftTop.x - RESIZE_FIELD_RANGE &&
			layerY >= corners.leftTop.y - RESIZE_FIELD_RANGE &&
			layerX <= corners.leftTop.x + RESIZE_FIELD_RANGE && 
		 	layerY <= corners.leftTop.y + RESIZE_FIELD_RANGE) {
				this.resizeType = RESIZE_TYPES.LEFT_TOP;

				return true;
		}

		// if (
		// 	layerX >= corners.leftBottom.x - RESIZE_FIELD_RANGE &&
		// 	layerY >= corners.leftBottom.y - RESIZE_FIELD_RANGE &&
		// 	layerX <= corners.leftBottom.x + RESIZE_FIELD_RANGE &&
		// 	layerY <= corners.leftBottom.y + RESIZE_FIELD_RANGE) {
		// 	this.resizeType = RESIZE_TYPES.LEFT_BOTTOM;

		// 	return true;	
		// }

		return false;
	}

	_updateResizeCorners(opts) {
		const {x, y, width, height} = opts;

		opts.corners = {
			leftTop: {x, y},
			leftBottom: {x, y: y + height},
			rightTop: {x: x + width, y},
			rightBottom: {x: x + width, y: y + height},
		};
	}

	_resizeImage(layerX, layerY) {
		if (!this.isMouseDown) {
			return;
		}

		if (!Object.keys(this.resizeState).length) {
			this._recordResize(layerX, layerY);
		}

		this._resize(layerX, layerY);
	}

	_setResizeCursor() {
		this.cursor = 'nwse-resize';
	}

	_updateCursor() {
		if (document.body.style.cursor !== this.cursor) {
			document.body.style.cursor = this.cursor;
		}
	}

	_dropCursor() {
		this.cursor = 'default';
	}

	_recordResize(layerX, layerY) {
		this.resizeState.corners = this.draggableImage.corners;
		this.resizeState.mouseX = layerX;
		this.resizeState.mouseY = layerY;
	}

	_resize(layerX, layerY) {
		const {filename} = this.draggableImage;

		let diffX, diffY;

		switch (this.resizeType) {
			case RESIZE_TYPES.LEFT_TOP:
				diffX = this.resizeState.mouseX - layerX;
				diffY = this.resizeState.mouseY - layerY;

				this.state[filename].x = this.state[filename].x - diffX;
				this.state[filename].y = this.state[filename].y - diffY;
				this.state[filename].width = this.state[filename].width + diffX;
				this.state[filename].height = this.state[filename].height + diffY;

				break;

			// case RESIZE_TYPES.LEFT_BOTTOM:
			// 	diffX = this.resizeState.mouseX - layerX;
			// 	diffY = this.resizeState.mouseY - layerY;

			// 	console.log(this.state[filename].y);

			// 	this.state[filename].x = this.state[filename].x - diffX;
			// 	this.state[filename].width = this.state[filename].width + diffX;
			// 	this.state[filename].height = this.state[filename].height - diffY;

			// 	break;
		}

		this.resizeState.mouseX = layerX;
		this.resizeState.mouseY = layerY;
	}

	_resetResizeState() {
		this.resizeState = {};
		this.resizeType = null;
	}

	_updateOpacityRange() {
		if (!this.activeImage) {
			return updateOpacityRangeValue();
		}

		const {filename} = this.activeImage;
		const {opacity} = this.state[filename];

		updateOpacityRangeValue(opacity);
	}

	_updateSettingsTitle() {
		if (!this.activeImage) {
			return updateSettingsTitle();
		}

		const {filename} = this.activeImage;

		updateSettingsTitle(filename);
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
		this._updateCursor();

		requestAnimationFrame(this._servicesRunner.bind(this));
	}

	_draw() {
		clearCanvas(this.ctx, this.canvas);
		drawAllCachedImages(this.ctx, this.layers, this.state);
	}
}

module.exports = ImageConstructor;
