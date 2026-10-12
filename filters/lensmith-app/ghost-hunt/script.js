// Ghost Hunt — ghosts pop up all over the screen. Tap them before they vanish!
// Leave the pumpkins alone. 30 seconds.
var LENGTH = 30;
var state = "ready", t = 0, score = 0, best = 0, spawn = 0, items = [], endTime = -9, music = false;

function begin(lens) {
  state = "playing"; t = 0; score = 0; spawn = 0.4; items = [];
  lens.music("assets/spooky-loop.ogg", 0.4);
}

function tap(lens, x, y) {
  if (state !== "playing") {
    if (lens.time - endTime > 0.8) begin(lens);
    return;
  }
  for (var i = items.length - 1; i >= 0; i--) {
    var it = items[i];
    if (Math.abs(x - it.x) < it.size * 0.6 && Math.abs(y - it.y) < it.size * 0.7) {
      items.splice(i, 1);
      if (it.pumpkin) {
        score = Math.max(0, score - 3);
        lens.sound("buzz", 0.8);
        lens.flash(1, 0.5, 0.1);
        lens.popup("Not the pumpkin! -3");
      } else {
        score++;
        lens.sound("pop", 1, lens.random(0.6, 0.85));
        lens.burst("✨", it.x, it.y, 8, "Explode", 0.04);
      }
      return;
    }
  }
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.05);
  lens.sprite("assets/moon.png", 0.82, s.top - 0.2, 0.2, 0, 0.8);

  if (state === "playing") {
    t += dt;
    spawn -= dt;
    if (spawn <= 0) {
      var pumpkin = Math.random() < 0.18;
      items.push({ x: lens.random(0.15, 0.85), y: lens.random(s.top * 0.3, s.top * 0.82), size: pumpkin ? 0.18 : lens.random(0.16, 0.22),
        life: Math.max(0.9, 1.9 - t * 0.03), age: 0, pumpkin: pumpkin, wob: lens.random(0, 6) });
      spawn = Math.max(0.35, 0.9 - t * 0.02);
    }
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      it.age += dt;
      if (it.age > it.life) { items.splice(i, 1); continue; }
      var fade = Math.min(1, it.age / 0.2, (it.life - it.age) / 0.25);
      lens.sprite(it.pumpkin ? "assets/pumpkin.png" : "assets/ghost.png", it.x, it.y + Math.sin(lens.time * 4 + it.wob) * 0.01,
        it.size * (0.6 + 0.4 * Math.min(1, it.age / 0.2)), 0, fade);
    }
    if (t >= LENGTH) {
      state = "over"; endTime = lens.time; best = Math.max(best, score); items = [];
      lens.music(null); lens.sound("win");
    }
    lens.text("👻 " + score + "   " + Math.ceil(LENGTH - t) + "s", 0.5, s.top - 0.2, 0.07);
  }
  if (state === "ready") {
    lens.sprite("assets/ghost.png", 0.5, s.top * 0.72, 0.22, Math.sin(lens.time * 2) * 6);
    lens.text("Ghost Hunt", 0.5, s.top * 0.58, 0.1);
    lens.text("Tap the ghosts — not the pumpkins! Tap to start", 0.5, s.top * 0.5, 0.045);
  }
  if (state === "over") {
    lens.text(score + " ghosts caught!", 0.5, s.top * 0.62, 0.09);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.54, 0.05);
  }
}
