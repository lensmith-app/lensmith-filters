// Head Catch — move your head left and right to catch the fruit in your basket. Dodge the bombs!
var FOOD = ["🍎", "🍌", "🍇", "🍓", "🍑", "🍒", "🍍"];
var basketX = 0.5, items = [], score = 0, lives = 3, spawn = 0.5, t = 0, state = "playing", endTime = 0, best = 0;

function update(lens, dt) {
  var s = lens.screen;
  var y = s.top * 0.3;
  dt = Math.min(dt, 0.05);
  if (lens.face) {
    var target = 0.5 + (lens.face.x - 0.5) * 2.2;
    basketX += (Math.max(0.08, Math.min(0.92, target)) - basketX) * Math.min(1, dt * 12);
  }
  if (state === "playing" && lens.face) {
    t += dt;
    spawn -= dt;
    if (spawn <= 0) {
      var bomb = Math.random() < Math.min(0.3, 0.1 + t * 0.004);
      items.push({ x: lens.random(0.08, 0.92), y: s.top + 0.05, v: lens.random(0.35, 0.55) + t * 0.01,
        art: bomb ? "💣" : FOOD[Math.floor(lens.random(0, FOOD.length))], bomb: bomb, spin: lens.random(-180, 180) });
      spawn = Math.max(0.35, 0.9 - t * 0.012);
    }
  }
  for (var i = items.length - 1; i >= 0; i--) {
    var it = items[i];
    if (state === "playing") it.y -= it.v * dt;
    if (state === "playing" && Math.abs(it.x - basketX) < 0.09 && Math.abs(it.y - y) < 0.05) {
      if (it.bomb) {
        lives--; lens.sound("boom", 0.7); lens.burst("💥", it.x, it.y, 1, "Explode", 0.18); lens.flash(1, 0.4, 0.2);
        if (lives <= 0) { state = "over"; lens.sound("lose"); endTime = lens.time; best = Math.max(best, score); }
      } else { score++; lens.sound("chomp", 0.8, lens.random(0.9, 1.2)); lens.burst("✨", it.x, it.y, 5, "Explode", 0.04); }
      items.splice(i, 1);
      continue;
    }
    if (it.y < s.top * 0.2) { items.splice(i, 1); continue; }
    lens.sprite(it.art, it.x, it.y, 0.09, lens.time * it.spin);
  }
  lens.sprite("🧺", basketX, y, 0.16);
  var hearts = "";
  for (var h = 0; h < lives; h++) hearts += "❤️";
  lens.text(score + "  " + hearts, 0.5, s.top - 0.18, 0.08);
  if (!lens.face && state === "playing") lens.text("Show your face to move the basket", 0.5, s.top - 0.28, 0.045);
  if (state === "over") {
    lens.text("GAME OVER · " + score + " caught", 0.5, s.top * 0.6, 0.08);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.52, 0.05);
  }
}

function tap(lens) {
  if (state === "over" && lens.time - endTime > 0.8) { items = []; score = 0; lives = 3; t = 0; spawn = 0.5; state = "playing"; }
}
