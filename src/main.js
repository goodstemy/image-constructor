window.onload = () => {
	const ImageConstructor = require('./image-constructor.js');

	const canvas = document.querySelector('canvas');
	const inputImageChooser = document.querySelector('#inputImageChooser');
	const addImage = document.querySelector('#addImage');

	const ic = new ImageConstructor(canvas);

	addImage.addEventListener('click', e => ic.dispatchAddImage(e, inputImageChooser));

	canvas.addEventListener('mousedown', e => ic.canvasMouseDown(e));
	canvas.addEventListener('mousemove', e => ic.canvasMouseMove(e));
	canvas.addEventListener('mouseup', e => ic.canvasMouseUp(e));

	// TODO: implement add border on active image
	// canvas.addEventListener('click', e => ic.canvasClick(e));

};
