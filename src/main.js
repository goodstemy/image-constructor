window.onload = () => {
	const ImageConstructor = require('./image-constructor.js');

	const canvas = document.querySelector('canvas');
	const inputImageChooser = document.querySelector('#inputImageChooser');
	const addImage = document.querySelector('#addImage');
	const layers = document.querySelector('#layers');
	const opacityInput = document.querySelector('#opacity-input');
	const exportImage = document.querySelector('#export-image');

	const ic = new ImageConstructor(canvas);

	ic.setLayers(layers);

	addImage.addEventListener('click', e => ic.dispatchAddImage(e, inputImageChooser));

	canvas.addEventListener('mousedown', e => ic.canvasMouseDown(e));
	canvas.addEventListener('mousemove', e => ic.canvasMouseMove(e));
	canvas.addEventListener('mouseup', e => ic.canvasMouseUp(e));
	canvas.addEventListener('click', e => ic.canvasClick(e));

	opacityInput.addEventListener('change', e => ic.changeOpacity(e));

	exportImage.addEventListener('click', e => ic.exportImage(e));
};
