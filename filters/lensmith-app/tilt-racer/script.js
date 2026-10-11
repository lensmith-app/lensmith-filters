// Tilt Racer — tilt your head left and right to change lanes. Dodge the traffic!
var LANES = [0.25, 0.5, 0.75];
var lane = 1, carX = 0.5, cars = [], spawn = 0.8, dist = 0, state = "playing", best = 0, endTime = 0, leanWas = 0, roadOffset = 0;
var TRAFFIC = ["🚕", "🚙", "🚌", "🚓", "🚚"];

function lean(f) {
  var a = f.anchors.LeftEye, b = f.anchors.RightEye;
  var l = a.x < b.x ? a : b, r = a.x < b.x ? b : a;
  var d = (r.y - l.y) / f.width;
  if (d > 0.1) return -1;
  if (d < -0.1) return 1;
  return 0;
}

function tap(lens, x) {
  if (state === "over" && lens.time - endTime > 0.8) { cars = []; dist = 0; spawn = 0.8; lane = 1; state = "playing"; lens.music("beat", 0.3); return; }
  // Taps steer too: left or right half of the screen.
  if (state === "playing") { lane = Math.max(0, Math.min(2, lane + (x < 0.5 ? -1 : 1))); lens.sound("swish", 0.5); }
}

function update(lens, dt) {
  var s = lens.screen;
  var y = s.top * 0.3;
  dt = Math.min(dt, 0.05);
  var speed = 0.6 + dist * 0.004;
  if (lens.face && state === "playing") {
    var l = lean(lens.face);
    if (l !== 0 && l !== leanWas) { lane = Math.max(0, Math.min(2, lane + l)); lens.sound("swish", 0.5); }
    leanWas = l;
  }
  carX += (LANES[lane] - carX) * Math.min(1, dt * 10);
  if (state === "playing") {
    dist += speed * dt * 10;
    roadOffset = (roadOffset + speed * dt) % 0.2;
    spawn -= dt;
    if (spawn <= 0) {
      cars.push({ lane: Math.floor(lens.random(0, 3)), y: s.top + 0.1, art: TRAFFIC[Math.floor(lens.random(0, TRAFFIC.length))] });
      spawn = Math.max(0.45, 1.1 - dist * 0.002);
    }
  }
  // Road markings.
  for (var m = 0; m < 14; m++) {
    var my = s.top - m * 0.2 + roadOffset;
    if (my < s.top * 0.2) continue;
    lens.sprite("⬜", 0.375, my, 0.015, 0, 0.5);
    lens.sprite("⬜", 0.625, my, 0.015, 0, 0.5);
  }
  for (var i = cars.length - 1; i >= 0; i--) {
    var c = cars[i];
    if (state === "playing") c.y -= speed * dt;
    if (state === "playing" && Math.abs(LANES[c.lane] - carX) < 0.12 && Math.abs(c.y - y) < 0.1) {
      state = "over"; endTime = lens.time; best = Math.max(best, Math.floor(dist));
      lens.music(null); lens.sound("boom"); lens.sound("lose", 0.6);
      lens.burst("💥", carX, y, 1, "Explode", 0.2); lens.flash(1, 0.4, 0.2);
    }
    if (c.y < s.top * 0.15) { cars.splice(i, 1); continue; }
    lens.sprite(c.art, LANES[c.lane], c.y, 0.13);
  }
  lens.sprite("🏎️", carX, y, 0.15);
  lens.text(Math.floor(dist) + " m", 0.5, s.top - 0.18, 0.08);
  if (!lens.face && state === "playing") lens.text("Tilt your head (or tap a side) to steer", 0.5, s.top - 0.27, 0.045);
  if (state === "over") {
    lens.text("CRASH! " + Math.floor(dist) + " m", 0.5, s.top * 0.6, 0.09);
    lens.text("Best " + best + " m · tap to race again", 0.5, s.top * 0.52, 0.05);
  }
}
