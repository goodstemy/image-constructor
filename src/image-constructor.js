const EventListener = require('./event-listener.js');
const {resizeCanvas} = require('./common-modules.js');

class ImageConstructor {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.state = {};
		this.isMouseDown = false;

		this.choosedImage = null;
		this.lastDiff = null;

		this._startServices();

		this.el = new EventListener();

		// only for debug
		setInterval(() => console.log(this.state), 1000);
	}

	async dispatchAddImage(e, inputImageChooser) {
		const [filename, opts] = await this.el.dispatchAddImage(e, inputImageChooser);

		this._drawNewImage(opts);
		this._addNewImageToState(filename, opts);
	}

	canvasMouseDown(e) {
		this.el.canvasMouseDown(e);
	}

	_drawNewImage({image, x = 0, y = 0, width, height}) {
		window.ctx = this.ctx;
		window.img = image;
		console.log(image);
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
