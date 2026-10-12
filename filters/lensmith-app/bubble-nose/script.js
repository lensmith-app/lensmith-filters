// Bubble Nose — bubbles float up around you. Pop them with your nose! Gold bubbles are worth 5.
var LENGTH = 30;
var bubbles = [], score = 0, t = 0, spawn = 0, state = "ready", best = 0, endTime = 0;

function tap(lens) {
  if (state === "playing" || (state === "over" && lens.time - endTime < 0.8)) return;
  state = "playing"; t = 0; score = 0; bubbles = []; spawn = 0; lens.music("chill", 0.4);
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.05);
  var f = lens.face;
  if (state === "playing") {
    t += dt;
    spawn -= dt;
    if (spawn <= 0) {
      var gold = Math.random() < 0.12;
      bubbles.push({ x: lens.random(0.1, 0.9), y: s.top * 0.2, r: gold ? 0.06 : lens.random(0.05, 0.09), v: lens.random(0.12, 0.25),
        phase: lens.random(0, 6), gold: gold, pop: 0 });
      spawn = Math.max(0.25, 0.6 - t * 0.01);
    }
    if (t >= LENGTH) { state = "over"; lens.music(null); lens.sound("win"); endTime = lens.time; best = Math.max(best, score); lens.flash(0.7, 0.9, 1); }
  }
  for (var i = bubbles.length - 1; i >= 0; i--) {
    var b = bubbles[i];
    if (b.pop > 0) {
      b.pop -= dt;
      if (b.pop <= 0) { bubbles.splice(i, 1); continue; }
      lens.sprite(b.gold ? "assets/bubble-gold.png" : "assets/bubble.png", b.x, b.y, b.r * 2 * (1 + (0.15 - b.pop) * 6), 0, b.pop / 0.15);
      continue;
    }
    if (state === "playing") { b.y += b.v * dt; b.phase += dt * 2; }
    var x = b.x + Math.sin(b.phase) * 0.03;
    if (state === "playing" && f && Math.abs(f.anchors.NoseTip.x - x) < b.r + 0.02 && Math.abs(f.anchors.NoseTip.y - b.y) < b.r + 0.02) {
      score += b.gold ? 5 : 1; b.pop = 0.15; b.x = x; lens.sound(b.gold ? "sparkle" : "pop", 0.9, lens.random(1, 1.5));
      lens.burst(b.gold ? "⭐" : "💧", x, b.y, b.gold ? 8 : 5, "Explode", 0.03);
      continue;
    }
    if (b.y > s.top + 0.1) { bubbles.splice(i, 1); continue; }
    lens.sprite(b.gold ? "assets/bubble-gold.png" : "assets/bubble.png", x, b.y, b.r * 2);
  }
  if (f && state === "playing") lens.sprite("assets/bubble.png", f.anchors.NoseTip.x, f.anchors.NoseTip.y, 0.03, 0, 0.6);
  lens.text("🫧 " + score, 0.5, s.top - 0.18, 0.09);
  if (state === "playing") lens.text(Math.ceil(LENGTH - t) + "s", 0.5, s.top - 0.27, 0.055, 0.85);
  if (state === "ready") lens.text("Tap to start · pop bubbles with your nose!", 0.5, s.top - 0.28, 0.048);
  if (state === "over") {
    lens.text(score + " bubbles popped!", 0.5, s.top - 0.29, 0.075);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top - 0.37, 0.045);
  }
}
