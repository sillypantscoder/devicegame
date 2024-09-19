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
		scene.push(new BrightnessDoor(250, 180, 250, 50, (fraction, activated) => {
			return fraction < (activated ? 0.5 : 0.3);
		}));
		scene.push(new Door(500, 180, 250, 50, (door) => {
			// Find average red value in the camera image
			var values = { r: 0, g: 0, b: 0 };
			var max = 0;
			for (var y = 0; y < camera_data.length; y++) {
				for (var x = 0; x < camera_data[y].length; x++) {
					var pixel = camera_data[y][x]
					values.r += pixel.r
					values.g += pixel.g
					values.b += pixel.b
					max += 255;
				}
			}
			var redCheck = values.r * 0.7
			if (door.activated) redCheck = values.r * 0.9;
			console.log(
				"r: " + "|".repeat(Math.round(values.r / 1000000)) + "\n" +
				"g: " + "|".repeat(Math.round(values.g / 1000000)) + "\n" +
				"b: " + "|".repeat(Math.round(values.b / 1000000)) + "\n" +
				"R: " + "|".repeat(Math.round(redCheck / 1000000)))
			return redCheck > values.g && redCheck > values.b
		}));
	})
]
