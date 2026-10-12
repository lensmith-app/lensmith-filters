// Bat Swarm — bats circle your head. Open your mouth and they burst out with a screech!
var BATS = 9;
var bats = [], scattered = [], wasOpen = false, music = false;

function start(lens) {
  for (var i = 0; i < BATS; i++) {
    bats.push({ a: (i / BATS) * Math.PI * 2, speed: lens.random(0.9, 1.4), r: lens.random(0.85, 1.25), bob: lens.random(0, 6), size: lens.random(0.09, 0.14) });
  }
}

function update(lens, dt) {
  var s = lens.screen, f = lens.face;
  dt = Math.min(dt, 0.05);
  if (!music) { lens.music("assets/spooky-loop.ogg", 0.35); music = true; }
  var cx = f ? f.x : 0.5, cy = f ? f.y + f.width * 0.25 : s.top * 0.55;
  var rad = f ? f.width * 0.95 : 0.32;

  // Mouth opens: the circling bats fly off in all directions.
  var open = f ? f.mouthOpen > 0.4 : false;
  if (open && !wasOpen) {
    lens.sound("assets/screech.ogg", 0.9, lens.random(0.9, 1.15));
    for (var i = 0; i < 14; i++) {
      var a = lens.random(0, Math.PI * 2), v = lens.random(0.5, 0.9);
      scattered.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 0.2, t: 0, size: lens.random(0.07, 0.12) });
    }
  }
  wasOpen = open;

  for (var j = 0; j < bats.length; j++) {
    var b = bats[j];
    b.a += b.speed * dt;
    var x = cx + Math.cos(b.a) * rad * b.r;
    var y = cy + Math.sin(b.a) * rad * b.r * 0.55 + Math.sin(lens.time * 3 + b.bob) * 0.02;
    var frame = Math.floor(lens.time * 10 + b.bob) % 2 ? "assets/bat1.png" : "assets/bat2.png";
    // Bats behind the head (top half of the loop) are smaller and dimmer.
    var behind = Math.sin(b.a) > 0;
    lens.sprite(frame, x, y, b.size * (behind ? 0.8 : 1), Math.cos(b.a) * 15, behind ? 0.75 : 1);
  }

  for (var k = scattered.length - 1; k >= 0; k--) {
    var q = scattered[k];
    q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.t > 2.5) { scattered.splice(k, 1); continue; }
    lens.sprite(Math.floor(lens.time * 12 + k) % 2 ? "assets/bat1.png" : "assets/bat2.png", q.x, q.y, q.size, q.vx * 20, 1 - q.t / 2.5);
  }

  if (!f) lens.text("Show your face 🦇", 0.5, s.top - 0.22, 0.06);
  else lens.text("Open your mouth! 😱", 0.5, s.top - 0.22, 0.05, 0.85);
}
