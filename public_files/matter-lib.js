const _Matter = {
	// @ts-ignore
	Engine: Matter.Engine,
	// @ts-ignore
	Body: Matter.Body,
	// @ts-ignore
	Runner: Matter.Runner,
	// @ts-ignore
	Bodies: Matter.Bodies,
	// @ts-ignore
	Composite: Matter.Composite,
	// @ts-ignore
	Events: Matter.Events
}

class MatterBody {
	/**
	 * @param {any} _body
	 */
	constructor(_body) {
		this._body = _body
	}
	/**
	 * @param {any} amount
	 */
	setFriction(amount) {
		this._body.friction = amount
	}
	get position() {
		/** @type {{ x: number, y: number }} */
		var p = this._body.position
		return { x: p.x, y: p.y }
	}
	set position(newPos) {
		_Matter.Body.setPosition(this._body, newPos)
	}
	get angle() {
		/** @type {number} */
		var p = this._body.angle
		return p
	}
	/**
	 * @param {{ x: number, y: number }} v
	 */
	set v(v) {
		_Matter.Body.setVelocity(this._body, v);
	}
	get vx() {
		/** @type {number} */
		var a = _Matter.Body.getVelocity(this._body).x
		return a;
	}
	set vx(a) {
		this.v = { x: a, y: this.vy }
	}
	get vy() {
		/** @type {number} */
		var a = _Matter.Body.getVelocity(this._body).y
		return a;
	}
	set vy(a) {
		this.v = { x: this.vx, y: a }
	}
	/**
	 * @param {number} minX
	 * @param {number} minY
	 * @param {number} maxX
	 * @param {number} maxY
	 */
	clampPosition(minX, minY, maxX, maxY) {
		this.position = {
			x: Math.max(minX, Math.min(maxX, this.position.x)),
			y: Math.max(minY, Math.min(maxY, this.position.y))
		}
	}
}
class Composite {
	/**
	 * @param {any} _com
	 */
	constructor(_com) {
		this._com = _com
	}
	/**
	 * @param {MatterBody | MatterBody[]} body
	 */
	add(body) {
		if (body instanceof Array) {
			_Matter.Composite.add(this._com, body.map((v) => v._body))
		} else {
			_Matter.Composite.add(this._com, body._body)
		}
	}
	/**
	 * @param {MatterBody | MatterBody[]} body
	 */
	remove(body) {
		if (body instanceof Array) {
			_Matter.Composite.remove(this._com, body.map((v) => v._body))
		} else {
			_Matter.Composite.remove(this._com, body._body)
		}
	}
}
class Engine {
	constructor() {
		this._engine = _Matter.Engine.create();
		this.world = new Composite(this._engine.world)
	}
	run() {
		// create runner
		var runner = _Matter.Runner.create();
		// run the engine
		_Matter.Runner.run(runner, this._engine);
	}
	/**
	 * @param {() => void} handler
	 */
	onUpdate(handler) {
		_Matter.Events.on(this._engine, "afterUpdate", handler)
	}
}
class Bodies {
	/**
	 * @param {number} centerX
	 * @param {number} centerY
	 * @param {number} width
	 * @param {number} height
	 * @param {boolean} isStatic
	 */
	static rectangleFromCenter(centerX, centerY, width, height, isStatic) {
		var body = _Matter.Bodies.rectangle(centerX, centerY, width, height, { isStatic })
		return new MatterBody(body)
	}
	/**
	 * @param {number} leftX
	 * @param {number} topY
	 * @param {number} width
	 * @param {number} height
	 * @param {boolean} isStatic
	 */
	static rectangleFromTopLeft(leftX, topY, width, height, isStatic) {
		var body = _Matter.Bodies.rectangle(leftX + (width / 2), topY + (height / 2), width, height, { isStatic })
		return new MatterBody(body)
	}
	/**
	 * @param {DOMRect} rect
	 * @param {boolean} isStatic
	 */
	static rectangleFromDOMRect(rect, isStatic) {
		return Bodies.rectangleFromTopLeft(rect.x, rect.y, rect.width, rect.height, isStatic)
	}
}
