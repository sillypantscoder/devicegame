/**
 * @type {Engine}
 */
var engine = new Engine()
engine.run();

function createPlayer() {
	try {
		// button flags
		var pressingLeft = false
		var pressingRight = false
		// element
		var player = document.createElement("div")
		document.body.appendChild(player)
		// body
		var playerBody = Bodies.rectangleFromCenter(100, 100, 50, 50, false)
		engine.world.add(playerBody)
		playerBody.setFriction(0)
		engine.onUpdate(() => {
			player.setAttribute("style", `position: absolute; background: red; top: ${playerBody.position.y - 25}px; left: ${playerBody.position.x - 25}px; width: 50px; height: 50px; transform: rotate(${playerBody.angle}rad); z-index: 10000000;`)
			// update player v
			playerBody.vx *= 0.96
			if (pressingLeft) playerBody.vx -= 0.6;
			if (pressingRight) playerBody.vx += 0.6;
		})
		// key listeners
		document.addEventListener("keydown", (e) => {
			if (e.key.startsWith("Arrow")) e.preventDefault()
			if (e.key == "ArrowUp") playerBody.vy -= 9;
			if (e.key == "ArrowLeft") pressingLeft = true
			if (e.key == "ArrowRight") pressingRight = true
		})
		document.addEventListener("keyup", (e) => {
			if (e.key == "ArrowLeft") pressingLeft = false
			if (e.key == "ArrowRight") pressingRight = false
		})
		return playerBody
	} catch (e) {
		alert(e)
	}
	throw new Error("an error occurred");
}
var player = createPlayer()

function createWalls() {
	if (visualViewport == null) {
		alert("the game cannot run in this browser :(")
		return []
	}
	// var b = document.documentElement.getBoundingClientRect();
	var x = visualViewport.offsetLeft; // -b.x
	var y = visualViewport.offsetTop; // -b.y
	var w = visualViewport.width;
	var h = visualViewport.height;
	// create bodies
	const wallThickness = 150;
	var    top = Bodies.rectangleFromTopLeft(x, y - wallThickness, w, wallThickness, true)
	var bottom = Bodies.rectangleFromTopLeft(x, y + h            , w, wallThickness, true)
	var   left = Bodies.rectangleFromTopLeft(x - wallThickness, y, wallThickness, h, true)
	var  right = Bodies.rectangleFromTopLeft(x + w            , y, wallThickness, h, true)
	// clamp player pos
	player.clampPosition(x, y, x + w, y + h)
	// finish
	var walls = [top, bottom, left, right]
	engine.world.add(walls)
	return walls
}
function addWalls() {
	var walls = createWalls()
	// refresh the walls
	var i = 0
	engine.onUpdate(() => {
		// timer
		i = (i + 1) % 5;
		if (i != 0) return;
		// remove old walls
		engine.world.remove(walls)
		// add new walls
		walls = createWalls()
	})
}
addWalls()

/** @type {SceneItem[]} */
var scene = []

class SceneItem {
	constructor() {
		/** @type {MatterBody | null} */
		this.body = null
		/** @type {HTMLElement | null} */
		this.elm = null
	}
	add() {
		scene.push(this)
		// Add body
		if (this.body != null) {
			engine.world.add(this.body)
		}
		// Add element
		if (this.elm != null) {
			document.body.appendChild(this.elm)
		}
	}
	remove() {
		scene.splice(scene.indexOf(this), 1)
		// Remove body
		if (this.body != null) {
			engine.world.remove(this.body)
		}
		// Remove element
		if (this.elm != null) {
			this.elm.remove()
		}
	}
	update() {}
}
class Wall extends SceneItem {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor(x, y, w, h) {
		super()
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
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {() => boolean} getIsActivated
	 */
	constructor(x, y, w, h, getIsActivated) {
		super()
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.body = Bodies.rectangleFromTopLeft(x, y, w, h, true)
		this.elm = document.createElement("div")
		// Activation
		this.activated = true
		this.getIsActivated = getIsActivated
		this.timer = { v: 0, max: 9 }
	}
	updateActivation() {
		var newState = this.getIsActivated()
		if (newState && !this.activated) {
			// Activate
			engine.world.add(this.body)
		}
		if (this.activated && !newState) {
			// Deactivate
			engine.world.remove(this.body)
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

var currentLevelNo = 0
var currentLevel = levels[currentLevelNo]
currentLevel.build(scene)
scene.forEach((v) => v.add())

engine.onUpdate(() => {
	scene.forEach((v) => {
		v.update()
	})
});

/** @type {{ r: number, g: number, b: number }[][]} */
var camera_data = [];
(async () => {
	// Video camera
	var video = document.createElement("video")
	var canvas = document.createElement("canvas")
	var stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
	// use media stream
	video.srcObject = stream
	await /** @type {Promise<void>} */ (new Promise((resolve) => {
		function success() {
			video.removeEventListener("loadedmetadata", success)
			video.play()
			resolve()
		}
		video.addEventListener("loadedmetadata", success)
	}));
	// setup the canvas
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	var _ctx = canvas.getContext('2d', { willReadFrequently: true })
	if (_ctx == null) throw new Error("rendering context not available")
	var ctx = _ctx
	// Start the animation loop!
	var loop_pos = 0
	function handleVideoFrame() {
		if ((loop_pos += 1) % 10 == 0) {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
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
				if (pos.x >= canvas.width) {
					pos.y += 1;
					pos.x = 0;
					parsed_data.push([])
				}
			}
			// Save camera data
			camera_data = parsed_data
		}
		// Loop
		video.requestVideoFrameCallback(handleVideoFrame)
	}
	video.requestVideoFrameCallback(handleVideoFrame)
})();
