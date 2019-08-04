window.onload = () => {
	const canvas = document.querySelector('canvas');
	const inputImageChooser = document.querySelector('#inputImageChooser');
	const addImage = document.querySelector('#addImage');

	const ctx = canvas.getContext('2d');
	const cache = {};
	let isMouseDown = false;
	let choosedImage = null;

	// only for debug
	setInterval(() => console.log(cache), 1000);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	addImage.addEventListener('click', dispatchAddImage);
	canvas.addEventListener('mousedown', canvasMouseDown);
	canvas.addEventListener('mousemove', canvasMouseMove);
	canvas.addEventListener('mouseup', canvasMouseUp);

	function dispatchAddImage(e) {
		e.preventDefault();

		const reader = new FileReader();
		const file = inputImageChooser.files[0];
		const filename = file.name;

		reader.onload = (e) => {
			const img = new Image();
			const [x, y] = [0, 0];

			img.onload = () => {
				ctx.drawImage(img, x, y);

				const {width, height} = img;

				cache[filename] = {
					img,
					x,
					y,
					width,
					height,
					diffX: 0,
				};
			};

			img.src = e.target.result;
		};

		reader.readAsDataURL(file);
	}

	function canvasMouseDown(e) {
		if (!isMouseDown) {
			isMouseDown = !isMouseDown;
		}
	}

	function canvasMouseMove(e) {
		const {layerX, layerY} = e;

		if (isMouseDown && dragAnyImage(e) && choosedImage) {
			clearCanvas();

			const {img, width, height, x, y, filename} = choosedImage;

			if (!choosedImage.diffX) {
				choosedImage.diffX = layerX - x;
			}

			ctx.drawImage(img, layerX - choosedImage.diffX, 100);

			console.log(layerX, x, choosedImage.diffX);
			cache[filename].x = layerX - choosedImage.diffX;
			// cache[filename].y = layerY - y;
		}
	}

	function canvasMouseUp(e) {
		if (isMouseDown) {
			isMouseDown = !isMouseDown;
		}
	}

	function dragAnyImage({layerX, layerY}) {
		for (const [filename, opts] of Object.entries(cache)) {
			const {x, y, width, height, img} = opts;

			if (layerX >= x && layerX <= x + width && layerY >= y && layerY <= y + height) {
				choosedImage = {...opts, filename};
				return true;
			}
		}

		return false;
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
};
