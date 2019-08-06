class EventListener {
	dispatchAddImage(e, inputImageChooser) {
		e.preventDefault();

		return this._loadImage(inputImageChooser);
	}

	canvasMouseDown(e, isMouseDown) {
		if (!isMouseDown) {
			return !isMouseDown;
		}
	}

	canvasMouseUp(e, isMouseDown) {
		if (isMouseDown) {
			return !isMouseDown;
		}
	}

	async _loadImage(input) {
		const reader = new FileReader();
		const image = new Image();
		const file = inputImageChooser.files[0];
		const filename = file.name;

		reader.readAsDataURL(file);

		const readerEvent = await this._readerLoaded(reader);

		image.src = readerEvent.target.result;

		const {width, height} = await this._imageLoaded(image);

		return [filename, {
			image,
			width,
			height,
			x: 0,
			y: 0,
		}];
	}

	_readerLoaded(reader) {
		return new Promise(resolve => {
			reader.onload = e => {
				resolve(e);
			};
		});
	}

	_imageLoaded(image) {
		return new Promise(resolve => {
			image.onload = () => {
				resolve(image);
			}
		});
	}
}

module.exports = EventListener;