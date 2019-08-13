const {
	SETTINGS_TITLE_TEMPLATE,
	SETTINGS_TITLE_TEMPLATE_DEFAULT,
} = require('./constants.js');

const opacityInput = document.querySelector('#opacity-input');
const settingsTitle = document.querySelector('#image-name-settings');

module.exports = {
	fitCanvas: canvas => {
		canvas.width = window.innerWidth * 80 / 100;
		canvas.height = window.innerHeight;
	},

	clearCanvas: (ctx, canvas) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	drawAllCachedImages: (ctx, layers, state) => {
		for (let i = 0; i < layers.length; i++) {
			const filename = layers[i];
			const opts = state[filename];
			const {x, y, image, isActive, width, height, opacity} = opts;

			ctx.globalAlpha = opacity;

			ctx.drawImage(image, x, y, width, height);

			ctx.globalAlpha = 1;

			if (isActive) {
				module.exports.addBorderToImage(ctx, x - 2, y - 2, width + 4, height + 4);
			}
		}
	},

	addBorderToImage: (ctx, x, y, width, height) => {
		ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
	},

	addLayer: (layersDOM, filename, src) => {
		const layer = document.createElement('div');
		const layerPreview = document.createElement('div');
		const layerName = document.createElement('p');

		layer.className = 'layer';
		layer.id = filename;

		layerPreview.className = 'layer-preview';
		layerPreview.style.backgroundImage = `url(${src})`;

		layerName.id = 'layer-name';
		layerName.innerText = filename;

		layer.appendChild(layerPreview);
		layer.appendChild(layerName);

		if (!layersDOM.children.length) {
			layersDOM.appendChild(layer);
			return;
		}

		const lastLayer = layersDOM.children[0];

		layersDOM.insertBefore(layer, lastLayer);
	},

	getOptsOfLayer: (layersDOM, filename) => {
		const childrens = layersDOM.children;

		for (let i = 0; i < childrens.length; i++) {
			const children = childrens[i];

			if (children.id === filename) {
				return children.getBoundingClientRect();
			}
		}
	},

	getLayerByName: (layersDOM, filename) => {
		const childrens = layersDOM.children;

		for (let i = 0; i < childrens.length; i++) {
			const children = childrens[i];

			if (children.id === filename) {
				return children;
			}
		}
	},

	sortLayersByDOMLayers: (layersDOM) => {
		const childrens = layersDOM.children;
		const layers = [];

		for (let i = 0; i < childrens.length; i++) {
			const {id} = childrens[i];

			layers.unshift(id);
		}

		return layers;
	},

	updateOpacityRangeValue: value => typeof value !== 'undefined' ? 
		opacityInput.value = value : 
		opacityInput.value = 1,

	updateSettingsTitle: filename => filename ?
		settingsTitle.innerText = `${SETTINGS_TITLE_TEMPLATE} ${filename}` :
		settingsTitle.innerText = SETTINGS_TITLE_TEMPLATE_DEFAULT,
};
