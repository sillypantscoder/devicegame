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
		new Wall(game, 0, 300, 250, 50).add();
		// doors
		new TextElement(game, 350, 350, "^\nActivates when the camera is red").add();
		new Door(game, 350, 300, 250, 50, false, new DelayedActivator(new CameraRedActivator(game), 60)).add();
		new Door(game, 700, 300, 250, 50, false, new CameraBlackActivator(game)).add();
		new Wall(game, 1000, 300, 250, 50).add();
	})
]
