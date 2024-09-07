function calcOrbit(e, a, w, v) {
	v *= Math.PI * 2;
	let p = a * (1 - e * e);
	let r = p / (1 + e * Math.cos(v));

	let x = r * Math.cos(w + v);
	let y = r * Math.sin(w + v);

	let h = Math.sqrt(p * gravity);

	let vx = x * h * e * Math.sin(v) / (r * p) - h / r * (Math.sin(w + v));
	let vy = y * h * e * Math.sin(v) / (r * p) - h / r * (-Math.cos(w + v));
	
	return {
		x: x,
		y: y,
		vx: vx,
		vy: vy
	};
}