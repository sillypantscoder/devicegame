class Level {
	/**
	 * @param {(objects: SceneItem[]) => void} builder
	 */
	constructor(builder) {
		this.build = builder
	}
}

const levels = [
	new Level((scene) => {
		// floor
		scene.push(new Wall(0, 180, 250, 50));
		// door
		scene.push(new Door(250, 180, 250, 50, () => {
			// Find average brightness in the camera image
			var total = 0;
			var max = 0;
			for (var y = 0; y < camera_data.length; y++) {
				for (var x = 0; x < camera_data[y].length; x++) {
					var pixel = camera_data[y][x]
					var value = pixel.r + pixel.g + pixel.b
					total += value;
					max += 255 + 255 + 255;
				}
			}
			var fraction = total / max;
			if (this.activated) return fraction < 0.6;
			else return fraction < 0.3;
		}));
		scene.push(new Door(500, 180, 250, 50, () => {
			// Find average red value in the camera image
			var total = 0;
			var max = 0;
			for (var y = 0; y < camera_data.length; y++) {
				for (var x = 0; x < camera_data[y].length; x++) {
					var pixel = camera_data[y][x]
					var value = pixel.r - (pixel.g + pixel.b)
					total += value;
					max += 255;
				}
			}
			var fraction = total / max;
			console.log(fraction)
			if (this.activated) return fraction > -0.4;
			else return fraction > -0.3;
		}));
	})
]
