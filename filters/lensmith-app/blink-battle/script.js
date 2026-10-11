// Blink Battle — the staring contest. How long can you go without blinking?
var state = "ready", t = 0, best = 0, endTime = 0, distract = 0;
var TAUNTS = ["👀", "🫣", "🌬️", "🧅", "💨", "🪰"];

function tap(lens) {
  if (state === "playing") return;
  if (state === "over" && lens.time - endTime < 0.8) return;
  state = "playing"; t = 0; distract = 2;
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  if (state === "playing") {
    if (!f) { lens.text("Look at the camera!", 0.5, s.top * 0.55, 0.06); return; }
    t += dt;
    distract -= dt;
    if (distract <= 0) {
      lens.burst(TAUNTS[Math.floor(lens.random(0, TAUNTS.length))], f.x + lens.random(-0.25, 0.25), f.y + f.width * 0.6, 1, "Fountain", 0.12);
      distract = lens.random(1.5, 3);
    }
    if (f.eyesClosed) {
      state = "over"; endTime = lens.time; best = Math.max(best, t);
      lens.burst("😵", f.x, f.y, 10, "Explode", 0.08);
      lens.flash(1, 0.4, 0.4);
    }
  }
  lens.text("Blink Battle", 0.5, s.top - 0.18, 0.07);
  if (state === "ready") lens.text("Tap, then don't blink!", 0.5, s.top - 0.27, 0.055);
  if (state === "playing") lens.text(t.toFixed(1) + "s 👁️👁️", 0.5, s.top - 0.29, 0.1);
  if (state === "over") {
    lens.text("YOU BLINKED! " + t.toFixed(1) + "s", 0.5, s.top - 0.29, 0.08);
    lens.text("Best " + best.toFixed(1) + "s · tap to go again", 0.5, s.top - 0.37, 0.045);
  }
}
