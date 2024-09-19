class Game {
	constructor() {
		this.engine = new Engine()
		/** @type {SceneItem[]} */
		this.scene = []
		// device data
		this.camera = new CameraReader()
		this.camera.loadVideo()
	}
	start() {
		this.engine.run()
		// scene
		var _game = this
		var t = new TextElement(this, 0, 0, "hi")
		t.add()
		this.engine.onUpdate(() => {
			_game.scene.forEach((v) => {
				v.update()
			})
			t.t = String(_game.scene.length)
		});
	}
	buildLevel() {
		var player = new Player(this)
		player.add()
		var borders = new ScreenBorderSet(this)
		borders.add()
		levels[0].build(this)
	}
	static main() {
		var game = new Game()
		// @ts-ignore
		window.game = game
		game.start()
		game.buildLevel()
	}
}
class SceneItem {
	/**
	 * @param {Game} game
	 */
	constructor(game) {
		this.game = game
		/** @type {MatterBody | null} */
		this.body = null
		/** @type {HTMLElement | null} */
		this.elm = null
	}
	add() {
		this.game.scene.push(this)
		// Add body
		if (this.body != null) {
			this.game.engine.world.add(this.body)
		}
		// Add element
		if (this.elm != null) {
			document.body.appendChild(this.elm)
		}
	}
	remove() {
		this.game.scene.splice(this.game.scene.indexOf(this), 1)
		// Remove body
		if (this.body != null) {
			this.game.engine.world.remove(this.body)
		}
		// Remove element
		if (this.elm != null) {
			this.elm.remove()
		}
	}
	update() {}
}
class Player extends SceneItem {
	/**
	 * @param {Game} game
	 */
	constructor(game) {
		super(game)
		this.pressingLeft = false
		this.pressingRight = false
		// element
		this.elm = document.createElement("div")
		document.body.appendChild(this.elm)
		// body
		this.body = Bodies.rectangleFromCenter(100, 100, 50, 50, false)
		this.body.setFriction(0)
	}
	add() {
		super.add()
		// key listeners
		var _player = this
		document.addEventListener("keydown", (e) => {
			if (e.key.startsWith("Arrow")) e.preventDefault()
			if (e.key == "ArrowUp") {
				if (_player.canJump()) _player.body.vy -= 9;
			}
			if (e.key == "ArrowLeft") _player.pressingLeft = true
			if (e.key == "ArrowRight") _player.pressingRight = true
		})
		document.addEventListener("keyup", (e) => {
			if (e.key == "ArrowLeft") _player.pressingLeft = false
			if (e.key == "ArrowRight") _player.pressingRight = false
		})
	}
	update() {
		this.elm.setAttribute("style", `position: absolute; background: red; top: ${this.body.position.y - 25}px; left: ${this.body.position.x - 25}px; width: 50px; height: 50px; transform: rotate(${this.body.angle}rad); z-index: 10000000;`)
		// update player v
		this.body.vx *= 0.96
		if (this.pressingLeft) this.body.vx -= 0.6;
		if (this.pressingRight) this.body.vx += 0.6;
	}
	canJump() {
		var checkPoint = {
			x: this.body.position.x,
			y: this.body.position.y + 35
		}
		// look through all the bodies
		for (var i = 0; i < this.game.scene.length; i++) {
			var body = this.game.scene[i].body
			if (body == null) continue
			if (body == this.body) continue
			if (! this.game.engine.world.includes(body)) continue
			if (body.isPointInsideShape(checkPoint)) return true;
		}
		return false;
	}
}
class ScreenBorderSet extends SceneItem {
	wallThickness = 150
	/**
	 * @param {Game} game
	 */
	constructor(game) {
		super(game);
		/** @type {InvisibleWall[]} */
		this.walls = []
		this.loadBodies()
		this.addBodies()
		this.timer = 0;
	}
	loadBodies() {
		if (visualViewport == null) {
			alert("the game cannot run in this browser :(")
			return []
		}
		var b = document.documentElement.getBoundingClientRect();
		var x = -b.x;
		var y = -b.y;
		var w = visualViewport.width;
		var h = visualViewport.height;
		const t = this.wallThickness;
		// create walls
		this.walls.push(new InvisibleWall(this.game, x, y - t, w, t))
		this.walls.push(new InvisibleWall(this.game, x, y + h, w, t))
		this.walls.push(new InvisibleWall(this.game, x - t, y, t, h))
		this.walls.push(new InvisibleWall(this.game, x + w, y, t, h))
		// clamp player pos
		for (var item of this.game.scene) {
			if (item instanceof Player) {
				var body = item.body
				body.clampPosition(x, y, x + w, y + h)
			}
		}
	}
	addBodies() {
		this.walls.forEach((v) => v.add())
	}
	removeBodies() {
		this.walls.forEach((v) => v.remove())
		this.walls = []
	}
	updateWalls() {
		this.removeBodies()
		this.loadBodies()
		this.addBodies()
	}
	update() {
		this.timer += 1;
		this.timer %= 10;
		if (this.timer == 0) {
			this.updateWalls()
		}
	}
}
class InvisibleWall extends SceneItem {
	/**
	 * @param {Game} game
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(game, x, y, w, h) {
		super(game);
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.body = Bodies.rectangleFromTopLeft(x, y, w, h, true)
	}
}
class TextElement extends SceneItem {
	/**
	 * @param {Game} game
	 * @param {number} x
	 * @param {number} y
	 * @param {string} t
	 */
	constructor(game, x, y, t) {
		super(game)
		this.x = x
		this.y = y
		this.t = t
		this.elm = document.createElement("div")
	}
	update() {
		this.elm.setAttribute("style", `left: ${this.x}px; top: ${this.y}px; width: max-content; height: max-content; background: transparent; font-family: sans-serif; white-space: pre;`)
		this.elm.innerText = this.t
	}
}
class Wall extends SceneItem {
	/**
	 * @param {Game} game
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(game, x, y, w, h) {
		super(game)
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.body = Bodies.rectangleFromTopLeft(x, y, w, h, true)
		this.elm = document.createElement("div")
	}
	update() {
		this.elm.setAttribute("style", `left: ${this.x}px; top: ${this.y}px; width: ${this.w}px; height: ${this.h}px;`)
	}
}
class Door extends SceneItem {
	/**
	 * @param {Game} game
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(game, x, y, w, h) {
		super(game)
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.body = Bodies.rectangleFromTopLeft(x, y, w, h, true)
		this.elm = document.createElement("div")
		// Activation
		this.activated = true
		this.timer = { v: 5, max: 5 }
	}
	getIsActivated() {
		return true;
	}
	updateActivation() {
		var newState = this.getIsActivated()
		if (newState && !this.activated) {
			// Activate
			this.game.engine.world.add(this.body)
		}
		if (this.activated && !newState) {
			// Deactivate
			this.game.engine.world.remove(this.body)
		}
		this.activated = newState
	}
	update() {
		// Timer
		this.timer.v += 1;
		if (this.timer.v >= this.timer.max) {
			this.timer.v = 0;
			this.updateActivation();
		}
		// Element
		this.elm.setAttribute("style", `left: ${this.x}px; top: ${this.y}px; width: ${this.w}px; height: ${this.h}px; background: ${this.activated ? "gray" : "transparent"}; outline: 1px solid black;`)
	}
}
class BrightnessDoor extends Door {
	/**
	 * @param {Game} game
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {(fraction: number, activated: boolean) => boolean} brightnessCheck
	 */
	constructor(game, x, y, w, h, brightnessCheck) {
		super(game, x, y, w, h)
		this.brightnessCheck = brightnessCheck
	}
	getIsActivated() {
		var camera_data = this.game.camera.camera_data;
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
		return this.brightnessCheck(fraction, this.activated)
	}
}

class CameraReader {
	constructor() {
		/** @type {{ r: number, g: number, b: number }[][]} */
		this.camera_data = [];
		this.video = document.createElement("video")
		this.canvas = document.createElement("canvas")
		this.loop_pos = 0;
		/** @type {CanvasRenderingContext2D | null} */
		this.ctx = null
	}
	async loadVideo() {
		// get video stream
		var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		// load the video
		this.video.srcObject = stream
		await this.videoLoaded()
		// setup the canvas
		this.canvas.width = this.video.videoWidth;
		this.canvas.height = this.video.videoHeight;
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
		// start the animation loop!
		this.loop()
	}
	videoLoaded() {
		var _video = this.video
		/** @type {Promise<void>} */
		var p = new Promise((resolve) => {
			function success() {
				_video.removeEventListener("loadedmetadata", success)
				_video.play()
				resolve()
			}
			_video.addEventListener("loadedmetadata", success)
		});
		return p
	}
	handleVideoFrame() {
		if (this.ctx == null) throw new Error("rendering context not available")
		if ((this.loop_pos += 1) % 6 == 0) {
			this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
			var data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data
			// Parse the data
			/** @type {{ r: number, g: number, b: number }[][]} */
			var parsed_data = [[]]
			var pos = { x: 0, y: 0 }
			for (var i = 0; i < data.length; i += 4) {
				parsed_data[parsed_data.length - 1].push({
					r: data[i],
					g: data[i + 1],
					b: data[i + 2]
				})
				// update pos
				pos.x += 1;
				if (pos.x >= this.canvas.width) {
					pos.y += 1;
					pos.x = 0;
					parsed_data.push([])
				}
			}
			// Save camera data
			this.camera_data = parsed_data
		}
		// Loop
		this.loop()
	}
	loop() {
		var _reader = this
		setTimeout(() => _reader.handleVideoFrame(), 16)
	}
}
/**
 * @param {Game} game
 * @param {Object} data
 */
function log(game, data) {
	var s = data.toString()
	var t = new TextElement(game, Math.random() * 1000, Math.random() * 1000, s)
	t.add()
	setTimeout(() => {
		t.remove()
	}, 1500)
}

Game.main()
