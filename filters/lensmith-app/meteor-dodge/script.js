// Meteor Dodge — move your head left and right to steer the rocket. Don't get hit!
var rocketX = 0.5, rocks = [], spawn = 0.5, alive = 0, best = 0, state = "playing", endTime = 0;

function update(lens, dt) {
  var s = lens.screen;
  var y = s.top * 0.3;
  dt = Math.min(dt, 0.05);
  if (lens.face) {
    // Small head moves steer the whole width.
    var target = 0.5 + (lens.face.x - 0.5) * 2.2;
    rocketX += (Math.max(0.08, Math.min(0.92, target)) - rocketX) * Math.min(1, dt * 10);
  }

  if (state === "playing" && lens.face) {
    alive += dt;
    spawn -= dt;
    if (spawn <= 0) {
      rocks.push({ x: lens.random(0.05, 0.95), y: s.top + 0.1, v: lens.random(0.5, 0.8) + alive * 0.02, spin: lens.random(-200, 200) });
      spawn = Math.max(0.25, 0.8 - alive * 0.02);
    }
  }
  for (var i = rocks.length - 1; i >= 0; i--) {
    var r = rocks[i];
    r.y -= r.v * dt;
    if (state === "playing" && Math.abs(r.x - rocketX) < 0.075 && Math.abs(r.y - y) < 0.08) {
      state = "over";
      endTime = lens.time;
      best = Math.max(best, alive);
      lens.burst("💥", rocketX, y, 1, "Explode", 0.2);
      lens.burst("🔥", rocketX, y, 10, "Explode", 0.06);
      lens.flash(1, 0.4, 0.1);
    }
    if (r.y < s.top * 0.15) rocks.splice(i, 1);
    else lens.sprite("☄️", r.x, r.y, 0.11, lens.time * r.spin);
  }
  if (state === "playing") lens.sprite("🚀", rocketX, y, 0.12, 45);

  lens.text(alive.toFixed(1) + "s", 0.5, s.top - 0.2, 0.1);
  if (!lens.face && state === "playing") lens.text("Show your face to steer", 0.5, s.top - 0.3, 0.05);
  if (state === "over") {
    lens.text("BOOM! " + alive.toFixed(1) + "s", 0.5, s.top * 0.6, 0.1);
    lens.text("Best " + best.toFixed(1) + "s · tap to retry", 0.5, s.top * 0.52, 0.05);
  }
}

function tap(lens) {
  if (state === "over" && lens.time - endTime > 0.8) { rocks = []; alive = 0; spawn = 0.5; state = "playing"; }
}
