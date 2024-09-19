class Level {
	/**
	 * @param {(game: Game) => void} builder
	 */
	constructor(builder) {
		this.build = builder
	}
}

const levels = [
	new Level((game) => {
		// floor
		new Wall(game, 0, 180, 250, 50).add();
		// door
		new BrightnessDoor(game, 250, 180, 250, 50, (fraction, activated) => {
			return fraction < (activated ? 0.5 : 0.3);
		}).add();
		var door = new Door(game, 500, 180, 250, 50);
		door.getIsActivated = function () {
			var camera_data = this.game.camera.camera_data
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
			var amtCheck = values.g * 0.7
			if (door.activated) amtCheck = values.g * 0.8;
			console.log(
				"r: " + "|".repeat(Math.round(values.r / 1000000)) + "\n" +
				"g: " + "|".repeat(Math.round(values.g / 1000000)) + "\n" +
				"b: " + "|".repeat(Math.round(values.b / 1000000)) + "\n" +
				"G: " + "|".repeat(Math.round(amtCheck / 1000000)))
			return amtCheck > values.r && amtCheck > values.b
		};
		door.add();
	})
]
