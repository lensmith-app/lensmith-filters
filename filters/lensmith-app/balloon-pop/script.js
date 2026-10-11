// Balloon Pop — tap the balloons before they float away. 30 seconds, go!
var LENGTH = 30;
var COLORS = ["🎈"];
var balloons = [], score = 0, t = 0, spawn = 0, state = "ready", best = 0;

function tap(lens, x, y) {
  if (state !== "playing") {
    state = "playing"; t = 0; score = 0; balloons = []; spawn = 0; lens.music("arcade", 0.35);
    return;
  }
  for (var i = balloons.length - 1; i >= 0; i--) {
    var b = balloons[i];
    if (Math.abs(x - b.x) < b.size * 0.55 && Math.abs(y - b.y) < b.size * 0.7) {
      score += b.gold ? 3 : 1;
      lens.sound(b.gold ? "coin" : "pop", 1, lens.random(0.85, 1.2));
      lens.burst(b.gold ? "⭐" : "💥", b.x, b.y, b.gold ? 8 : 1, "Explode", b.gold ? 0.05 : 0.12);
      balloons.splice(i, 1);
      return;
    }
  }
}

function update(lens, dt) {
  var s = lens.screen;
  var floor = s.top * 0.22;
  dt = Math.min(dt, 0.05);
  if (state === "playing") {
    t += dt;
    spawn -= dt;
    if (spawn <= 0) {
      var gold = Math.random() < 0.1;
      balloons.push({ x: lens.random(0.12, 0.88), y: floor, size: gold ? 0.11 : lens.random(0.12, 0.17),
        v: lens.random(0.25, 0.45) + t * 0.01, sway: lens.random(0, 6), gold: gold });
      spawn = Math.max(0.3, 0.8 - t * 0.015);
    }
    if (t >= LENGTH) { state = "over"; lens.music(null); lens.sound("win"); best = Math.max(best, score); lens.flash(1, 0.9, 0.5); }
  }
  for (var i = balloons.length - 1; i >= 0; i--) {
    var b = balloons[i];
    if (state === "playing") b.y += b.v * dt;
    if (b.y > s.top + 0.1) { balloons.splice(i, 1); continue; }
    lens.sprite(b.gold ? "🌟" : "🎈", b.x + Math.sin(lens.time * 2 + b.sway) * 0.02, b.y, b.size, Math.sin(lens.time * 2 + b.sway) * 8);
  }
  lens.text("🎈 " + score, 0.5, s.top - 0.18, 0.09);
  if (state === "playing") lens.text(Math.ceil(LENGTH - t) + "s", 0.5, s.top - 0.28, 0.06, 0.8);
  if (state === "ready") lens.text("Tap to start popping!", 0.5, s.top * 0.55, 0.065);
  if (state === "over") {
    lens.text("TIME! " + score + " popped", 0.5, s.top * 0.58, 0.09);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.5, 0.05);
  }
}
