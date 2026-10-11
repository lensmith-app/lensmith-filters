// Nose Balance — keep the beach ball balanced on your nose like a sea lion! Tilt your head and
// move under it to stop it rolling off.
var offset = 0, vel = 0, t = 0, best = 0, state = "ready", prevNose = null, fallX = 0, fallY = 0, fallV = 0, endTime = 0, spin = 0;

function slope(f) {
  var a = f.anchors.LeftEye, b = f.anchors.RightEye;
  var l = a.x < b.x ? a : b, r = a.x < b.x ? b : a;
  return (r.y - l.y) / Math.max(0.01, r.x - l.x);
}

function tap(lens) {
  if (state === "playing" || (state === "over" && lens.time - endTime < 0.8)) return;
  if (!lens.face) return;
  state = "playing"; lens.sound("bounce"); t = 0; offset = lens.random(-0.01, 0.01); vel = 0; prevNose = null;
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  dt = Math.min(dt, 0.05);
  var size = f ? f.width * 0.48 : 0.16;
  if (state === "playing" && f) {
    t += dt;
    var nose = f.anchors.NoseTip.x;
    if (prevNose !== null) offset -= (nose - prevNose) * 0.9;   // the ball lags behind when you move
    prevNose = nose;
    // Rolls downhill along your head's tilt, and the wobble grows the longer you go.
    vel += (slope(f) * -1.4 + offset * (3 + t * 0.08)) * dt;
    vel *= Math.pow(0.6, dt);
    offset += vel * dt;
    spin += vel * dt * 2000;
    if (Math.abs(offset) > f.width * 0.45) {
      lens.sound("whoosh");
      state = "falling"; fallX = nose + offset; fallY = f.anchors.NoseTip.y + size * 0.6; fallV = 0;
      best = Math.max(best, t); endTime = lens.time;
    }
  }
  if (state === "falling") {
    fallV += 2.5 * dt; fallY -= fallV * dt; fallX += (offset > 0 ? 0.3 : -0.3) * dt; spin += 400 * dt;
    if (fallY < s.top * 0.1) { state = "over"; lens.sound("lose"); lens.flash(1, 0.5, 0.4); }
    lens.sprite("assets/beachball.png", fallX, fallY, size, spin);
  }
  if (f && (state === "playing" || state === "ready")) {
    lens.sprite("assets/beachball.png", f.anchors.NoseTip.x + offset, f.anchors.NoseTip.y + size * 0.62, size, spin);
  }
  lens.text(t.toFixed(1) + "s", 0.5, s.top - 0.18, 0.1);
  if (state === "ready") lens.text(f ? "Tap to start balancing!" : "Show your face", 0.5, s.top - 0.29, 0.055);
  if (state === "playing" && Math.abs(offset) > (f ? f.width * 0.3 : 1)) lens.text("Whoa!", 0.5, s.top - 0.29, 0.07);
  if (state === "over" || state === "falling") {
    lens.text("Dropped it! " + t.toFixed(1) + "s", 0.5, s.top - 0.29, 0.075);
    lens.text("Best " + best.toFixed(1) + "s · tap to try again", 0.5, s.top - 0.37, 0.045);
  }
}
