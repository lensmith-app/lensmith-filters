// Sky Jumper — bounce from platform to platform. Move your head left and right to steer (or tap
// a side of the screen). How high can you go?
var px = 0.5, py = 0, vy = 0, platforms = [], camera = 0, height = 0, state = "ready", best = 0, endTime = 0, tapPush = 0;
var PW = 0.2;

function reset(lens) {
  var s = lens.screen;
  platforms = [];
  for (var i = 0; i < 12; i++) platforms.push({ x: i === 0 ? 0.5 : lens.random(0.15, 0.85), y: s.top * 0.28 + i * 0.22, moving: false });
  px = 0.5; py = s.top * 0.28 + 0.05; vy = 1.6; camera = 0; height = 0;
}

function tap(lens, x) {
  if (state !== "playing") {
    if (state === "over" && lens.time - endTime < 0.8) return;
    reset(lens); state = "playing"; lens.music("arcade", 0.3); return;
  }
  tapPush = x < 0.5 ? -0.25 : 0.25;
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.04);
  if (state === "ready" && platforms.length === 0) reset(lens);
  if (state === "playing") {
    if (lens.face) {
      var target = 0.5 + (lens.face.x - 0.5) * 2.4;
      px += (target - px) * Math.min(1, dt * 6);
    }
    px += tapPush; tapPush = 0;
    if (px < -0.05) px = 1.05; if (px > 1.05) px = -0.05;      // wrap around the sides
    vy -= 3.2 * dt;
    py += vy * dt;
    if (vy < 0) {
      for (var i = 0; i < platforms.length; i++) {
        var p = platforms[i];
        if (Math.abs(px - p.x) < PW / 2 + 0.03 && py - 0.06 <= p.y + 0.02 && py - 0.06 >= p.y - 0.04) {
          vy = 1.65; lens.sound("jump", 0.6, lens.random(0.95, 1.2)); lens.burst("✨", px, p.y + 0.02, 4, "Explode", 0.03);
        }
      }
    }
    // Follow the jumper upward.
    var want = py - s.top * 0.45;
    if (want > camera) camera = want;
    height = Math.max(height, Math.floor(camera * 10));
    for (var j = 0; j < platforms.length; j++) {
      var q = platforms[j];
      if (q.moving) { q.x += Math.sin(lens.time * 1.5 + j) * dt * 0.3; }
      if (q.y - camera < s.top * 0.15) {
        // Recycle platforms that scroll off the bottom to the top.
        var topMost = 0;
        for (var k = 0; k < platforms.length; k++) topMost = Math.max(topMost, platforms[k].y);
        q.y = topMost + 0.18 + Math.min(0.12, height * 0.001);
        q.x = lens.random(0.15, 0.85);
        q.moving = height > 40 && Math.random() < 0.3;
      }
    }
    if (py - camera < s.top * 0.1) { state = "over"; lens.music(null); lens.sound("lose"); endTime = lens.time; best = Math.max(best, height); lens.flash(1, 0.5, 0.4); }
  }
  for (var m = 0; m < platforms.length; m++) {
    var sy = platforms[m].y - camera;
    if (sy > s.top * 0.15 && sy < s.top) lens.sprite("assets/platform.png", platforms[m].x, sy, PW);
  }
  if (state !== "over") lens.sprite("assets/jumper.png", px, py - camera, 0.11, vy > 0 ? 0 : 8);
  lens.text(height + " m", 0.5, s.top - 0.18, 0.09);
  if (state === "ready") lens.text("Tap to start · steer with your head", 0.5, s.top * 0.6, 0.05);
  if (state === "over") {
    lens.text("You fell! " + height + " m", 0.5, s.top * 0.6, 0.085);
    lens.text("Best " + best + " m · tap to jump again", 0.5, s.top * 0.52, 0.045);
  }
}
