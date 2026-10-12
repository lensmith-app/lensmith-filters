// Whack-a-Mole — tap the moles as they pop up. Don't hit the bunnies!
var LENGTH = 30;
var holes = [], score = 0, t = 0, next = 0, state = "ready", best = 0;

function start(lens) {
  var s = lens.screen;
  holes = [];
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      holes.push({ x: 0.2 + c * 0.3, y: s.top * 0.32 + r * 0.32, up: 0, kind: "", hit: false });
    }
  }
}

function tap(lens, x, y) {
  if (state !== "playing") { state = "playing"; t = 0; score = 0; next = 0.5; lens.music("arcade", 0.3); return; }
  for (var i = 0; i < holes.length; i++) {
    var h = holes[i];
    if (h.up > 0 && !h.hit && Math.abs(x - h.x) < 0.13 && Math.abs(y - (h.y + 0.05)) < 0.13) {
      h.hit = true;
      if (h.kind === "🐰") { score = Math.max(0, score - 2); lens.sound("buzz"); lens.flash(1, 0.3, 0.3); lens.popup("Not the bunny!"); }
      else { score++; lens.sound("bounce", 1, lens.random(0.9, 1.3)); lens.burst("💥", h.x, h.y + 0.05, 1, "Explode", 0.12); }
      h.up = Math.min(h.up, 0.25);
      return;
    }
  }
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.05);
  if (state === "playing") {
    t += dt;
    next -= dt;
    if (next <= 0) {
      var h = holes[Math.floor(lens.random(0, holes.length))];
      if (h.up <= 0) { h.up = Math.max(0.6, 1.3 - t * 0.02); h.kind = Math.random() < 0.15 ? "🐰" : "🐹"; h.hit = false; }
      next = Math.max(0.35, 0.9 - t * 0.02);
    }
    if (t >= LENGTH) { state = "over"; lens.music(null); lens.sound("win"); best = Math.max(best, score); lens.flash(1, 0.9, 0.5); }
  }
  for (var i = 0; i < holes.length; i++) {
    var h = holes[i];
    if (h.up > 0) h.up -= dt;
    lens.sprite("🕳️", h.x, h.y - 0.02, 0.2, 0, 0.9);
    if (h.up > 0) {
      var rise = Math.min(1, h.up * 6) * 0.07;
      lens.sprite(h.hit ? "😵" : h.kind, h.x, h.y + rise, 0.15);
    }
  }
  lens.text("🔨 " + score, 0.5, s.top - 0.18, 0.09);
  if (state === "playing") lens.text(Math.ceil(LENGTH - t) + "s", 0.5, s.top - 0.28, 0.06, 0.8);
  if (state === "ready") lens.text("Tap to start · skip the bunnies!", 0.5, s.top - 0.3, 0.05);
  if (state === "over") {
    lens.text("TIME! Score " + score, 0.5, s.top - 0.3, 0.08);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top - 0.38, 0.045);
  }
}
