class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
}

class Circle {
	constructor(x, y, r, col) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = col;
	}

	copy(other) {
		this.x = other.x;
		this.y = other.y;
		this.r = other.r;
		this.color.r = other.color.r;
		this.color.g = other.color.g;
		this.color.b = other.color.b;
		this.color.a = other.color.a;
	}
}

class Planet extends Circle {
	constructor(x, y, r, col, vx, vy) {
		super(x, y, r, col);
		this.vx = vx;
		this.vy = vy;
		this.ax = 0;
		this.ay = 0;
	}

	copy(other) {
		super.copy(other);
		this.vx = other.vx;
		this.vy = other.vy;
		this.ax = other.ax;
		this.ay = other.ay;
	}
}

class Line {
	constructor(x0, y0, x1, y1) {
		this.x0 = x0;
		this.y0 = y0;
		this.x1 = x1;
		this.y1 = y1;
	}
}

class Color {
	constructor(r, g, b, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	toString() {
		return `rgb(${this.r},${this.g},${this.b},${this.a})`
	}
}

class Camera {
	constructor(x, y, vh, a) {
		this.x = x;
		this.y = y;
		this.vw = vh * a;
		this.vh = vh;
	}
}

class State {
	constructor(cam, sun, planets) {
		this.camera = cam;
		this.sun = sun;
		this.planets = planets;
	}

	clone() {
		let cloned = new State(new Camera(), new Circle(), new Array(this.planets.length));
		Object.assign(cloned.camera, this.camera);
		cloned.sun.color = new Color();
		cloned.sun.copy(this.sun);
		for (let i = 0; i < this.planets.length; i++) {
			cloned.planets[i] = new Planet();
			cloned.planets[i].color = new Color();
			cloned.planets[i].copy(this.planets[i]);
		}
		return cloned;
	}

	copy(other) {
		Object.assign(this.camera, other.camera);
		this.sun.copy(other.sun);
		for (let i = 0; i < this.planets.length; i++) {
			this.planets[i].copy(other.planets[i]);
		}
	}
}

function renderRect(camera, rect, color) {
	let x = rect.x - rect.w / 2 - camera.x;
	x = ((x / camera.vw) + 0.5) * canvas.width;
  
	let y = rect.y + rect.h / 2 - camera.y;
	y = ((-y / camera.vh) + 0.5) * canvas.height;
  
	let w = rect.w / camera.vw * canvas.width;
	let h = rect.h / camera.vh * canvas.height;

	//console.log(x, y, w, h);
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
}

function renderCircle(camera, circle, color) {
	let x = ((circle.x - camera.x) / camera.vw + 0.5) * canvas.width;
	let y = ((camera.y - circle.y) / camera.vh + 0.5) * canvas.height;
	let r = circle.r / camera.vh * canvas.height;
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}

function renderLines(camera, lines, color) {
	ctx.strokeStyle = color;
	ctx.beginPath();
	for (const line of lines) {
		let x0 = ((line.x0 - camera.x) / camera.vw + 0.5) * canvas.width;
		let y0 = ((camera.y - line.y0) / camera.vh + 0.5) * canvas.height;
		let x1 = ((line.x1 - camera.x) / camera.vw + 0.5) * canvas.width;
		let y1 = ((camera.y - line.y1) / camera.vh + 0.5) * canvas.height;
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
	}
	ctx.stroke();
}

const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = innerWidth;
canvas.height = innerHeight * 0.8 | 0;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

const camera = new Camera(0, 0, 10, canvas.width / canvas.height)

let dt = 0.01;
let accumulator = 0;
let total = 0;

let lastTime = performance.now();

let lines = [];

let gravity = 1;

let simulate = false;



let sma = 1;
let ecc = 0;
let aop = 0;
let ta = 0;

let [smaInput, smaText] = document.getElementById("sma").children;
let [eccInput, eccText] = document.getElementById("ecc").children;
let [aopInput, aopText] = document.getElementById("aop").children;
let [taInput, taText] = document.getElementById("ta").children;

smaInput.addEventListener("input", initiate);
eccInput.addEventListener("input", initiate);
aopInput.addEventListener("input", initiate);
taInput.addEventListener("input", initiate);

let dat = calcOrbit(ecc, sma, aop, ta);

const currState = new State(
	new Camera(0, 0, 30, canvas.width / canvas.height),
	new Circle(0, 0, 1.5, new Color(255, 198, 28)),
	[
		new Planet(dat.x, dat.y, 1, new Color(0, 127, 220), dat.vx, dat.vy)
	]
);
const prevState = currState.clone();

function initiate() {
	smaText.innerHTML = `Semi-major Axis: ${smaInput.value}`;
	sma = parseFloat(smaInput.value);
	
	eccText.innerHTML = `Eccentricity: ${eccInput.value}`;
	ecc = parseFloat(eccInput.value);
	
	aopText.innerHTML = `Argument of Periapsis: ${aopInput.value}`;
	aop = parseFloat(aopInput.value) * Math.PI / 180;
	
	taText.innerHTML = `True Anomaly: ${taInput.value}`;
	ta = parseFloat(taInput.value) / 360;

	dat = calcOrbit(ecc, sma, aop, ta);

	currState.planets[0].x = dat.x;
	currState.planets[0].y = dat.y;
	currState.planets[0].vx = dat.vx;
	currState.planets[0].vy = dat.vy;
	
	prevState.planets[0].x = dat.x;
	prevState.planets[0].y = dat.y;
	prevState.planets[0].vx = dat.vx;
	prevState.planets[0].vy = dat.vy;
}

document.getElementById("ss").addEventListener("click", function() {
	if (!simulate) {
		simulate = true;
		this.innerHTML = "Stop";
	} else {
		simulate = false;
		this.innerHTML = "Start";
	}
});

window.requestAnimationFrame(main);

function update(dt, state) {
	for (const planet of state.planets) {
		let vecx = state.sun.x - planet.x;
		let vecy = state.sun.y - planet.y;

		let dist = Math.hypot(vecx, vecy);
		vecx /= dist;
		vecy /= dist;

		planet.ax = gravity * vecx / (dist * dist);
		planet.ay = gravity * vecy / (dist * dist);

		planet.vx += planet.ax * dt;
		planet.vy += planet.ay * dt;
		planet.x += planet.vx * dt;
		planet.y += planet.vy * dt;
	}
}

function render(prev, curr, t) {
	let vh = prev.camera.vh * (1 - t) + curr.camera.vh * t;
	let cam = new Camera(
		prev.camera.x * (1 - t) + curr.camera.x * t,
		prev.camera.y * (1 - t) + curr.camera.y * t,
		vh,
		(prev.camera.vw * (1 - t) + curr.camera.vw * t) / vh
	);
	let sun = new Circle(
		prev.sun.x * (1 - t) + curr.sun.x * t,
		prev.sun.y * (1 - t) + curr.sun.y * t,
		prev.sun.r,
		null
	);
	renderCircle(cam, sun, prev.sun.color);
	let planet = new Circle();
	planet.color = new Color();
	for (let i = 0; i < prev.planets.length; i++) {
		planet.x = prev.planets[i].x * (1 - t) + curr.planets[i].x * t;
		planet.y = prev.planets[i].y * (1 - t) + curr.planets[i].y * t;
		planet.r = prev.planets[i].r;
		renderCircle(cam, planet, prev.planets[i].color);
	}

	let vLine = new Line();
	vLine.x0 = prev.planets[0].x * (1 - t) + curr.planets[0].x * t;
	vLine.y0 = prev.planets[0].y * (1 - t) + curr.planets[0].y * t;
	vLine.x1 = prev.planets[0].vx * (1 - t) + curr.planets[0].vx * t;
	vLine.y1 = prev.planets[0].vy * (1 - t) + curr.planets[0].vy * t;
	vLine.x1 = vLine.x1 * 10 + vLine.x0;
	vLine.y1 = vLine.y1 * 10 + vLine.y0;

	if (keys["f"]) {
		console.log(line);
	}

	let aLine = new Line();
	aLine.x0 = vLine.x0;
	aLine.y0 = vLine.y0;
	aLine.x1 = prev.planets[0].ax * (1 - t) + curr.planets[0].ax * t;
	aLine.y1 = prev.planets[0].ay * (1 - t) + curr.planets[0].ay * t;
	aLine.x1 = aLine.x1 * 10 + aLine.x0;
	aLine.y1 = aLine.y1 * 10 + aLine.y0;

	renderLines(cam, [vLine, aLine], new Color(255, 0, 0));
}

function calcPath() {
	let state = currState.clone();
	let prev = currState.clone();
	update(dt, state);
	lines.length = 0;
	for (let i = 0; i < 5000; i++) {
		lines.push(new Line(prev.planets[0].x, prev.planets[0].y, state.planets[0].x, state.planets[0].y));
		prev.copy(state);
		update(dt, state);
	}
}

function main() {
	let thisTime = performance.now();
	let frameTime = (thisTime - lastTime) / 1000;
	lastTime = thisTime;

	frameTime *= 50;

	if (frameTime > 0.25)
		frameTime = 0.25

	accumulator += frameTime;
	
	ctx.fillStyle = new Color(0, 0, 0);
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	while (accumulator > dt) {
		if (simulate) {
			prevState.copy(currState);
			update(dt, currState);
		}
		accumulator -= dt;
		total += dt;
	}

	let a = accumulator / dt;

	render(prevState, currState, a);

	calcPath();
	renderLines(currState.camera, lines, new Color(145, 250, 112));
	window.requestAnimationFrame(main);
}

let keys = {};

document.addEventListener("keydown", function(e) {
	keys[e.key] = true;
});

document.addEventListener("keyup", function(e) {
	keys[e.key] = false;
})