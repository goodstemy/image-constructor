class EventListener {
	dispatchAddImage(e, inputImageChooser) {
		e.preventDefault();

		return this._loadImage(inputImageChooser);
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

	// _readerOnLoad(e) {
	// 		const img = new Image();
	// 		const [x, y] = [10, 0];

	// 		img.onload = () => {
	// 			const {width, height} = img;

	// 			return [
	// 				filename,
	// 				{
						
	// 				}
	// 			];
	// 		};

	// 		console.log(e);
	// 		img.src = e.target.result;
	// }
}

module.exports = EventListener;