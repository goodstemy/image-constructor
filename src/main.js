window.onload = () => {
	const ImageConstructor = require('./image-constructor.js');

	const canvas = document.querySelector('canvas');
	const inputImageChooser = document.querySelector('#inputImageChooser');
	const addImage = document.querySelector('#addImage');

	const ic = new ImageConstructor(canvas);

	addImage.addEventListener('click', e => ic.dispatchAddImage(e, inputImageChooser));
	canvas.addEventListener('mousedown', e => ic.canvasMouseDown(e));

/*
	canvas.addEventListener('mousemove', canvasMouseMove);
	canvas.addEventListener('mouseup', canvasMouseUp);
	canvas.addEventListener('click', canvasClick);

	function dispatchAddImage(e) {
		
	}

	function canvasMouseDown(e) {
		if (!isMouseDown) {
			isMouseDown = !isMouseDown;
		}
	}

	function canvasMouseMove(e) {
		const {layerX, layerY} = e;

		if (isMouseDown && isMouseOnImage(e) && choosedImage) {
			clearCanvas();

			const {img, width, height, x, y, filename} = choosedImage;

			if (lastDiffX === null && lastDiffY === null) {
				lastDiffX = layerX - x;
				lastDiffY = layerY - y;
			}

			ctx.drawImage(img, layerX - lastDiffX, layerY - lastDiffY);

			cache[filename].x = layerX - lastDiffX;
			cache[filename].y = layerY - lastDiffY;
		}
	}

	function canvasMouseUp(e) {
		if (isMouseDown) {
			isMouseDown = !isMouseDown;
			lastDiffX = null;
			lastDiffY = null;
			choosedImage = null;
		}
	}

	function canvasClick(e) {
		e.preventDefault();

		// if (!choosedImage) {
		// 	clearCanvas();
		// 	drawAllCachedImages();
		// 	return;
		// }

		if (isMouseOnImage(e)) {
			addBorder();
		}
	}

	function isMouseOnImage({layerX, layerY}) {
		for (const [filename, opts] of Object.entries(cache)) {
			const {x, y, width, height, img} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				console.log('===')
				if (!choosedImage) {
					choosedImage = {...opts, filename};
				}
				return true;
			}
		}

		return false;
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawAllCachedImages();
	}

	function drawAllCachedImages() {
		for (const [filename, opts] of Object.entries(cache)) {
			const {x, y, img} = opts;

			ctx.drawImage(img, x, y);
		}
	}

	function addBorder() {
		const {x, y, width, height} = choosedImage;

		ctx.rect(10, 10, 100, 100);

		ctx.rect(x - 2, y - 2, width + 2, height + 2);
	}
	*/
};
