// Space Defender — your nose steers the ship, it fires on its own. Blink for a screen-clearing
// bomb (recharges every 10 s). Don't let the aliens reach the bottom!
var ALIENS = { green: "assets/alien-green.png", purple: "assets/alien-purple.png" };
var shipX = 0.5, lasers = [], aliens = [], fire = 0, wave = 0, waveTimer = 0, score = 0, lives = 3, bomb = 1, bombCharge = 0;
var state = "ready", best = 0, endTime = 0, wasClosed = false;

function tap(lens) {
  if (state === "ready" || (state === "over" && lens.time - endTime > 0.8)) {
    state = "playing"; lens.music("arcade", 0.3); aliens = []; lasers = []; score = 0; lives = 3; wave = 0; waveTimer = 0.5; bomb = 1; bombCharge = 0;
  }
}

function spawnWave(lens) {
  wave++;
  var s = lens.screen;
  var n = Math.min(10, 3 + wave);
  for (var i = 0; i < n; i++) {
    aliens.push({ x: 0.12 + (i % 5) * 0.19, y: s.top + 0.05 + Math.floor(i / 5) * 0.14, phase: lens.random(0, 6),
      kind: i % 2 ? "purple" : "green", hp: wave > 4 && i % 3 === 0 ? 2 : 1, speed: 0.06 + wave * 0.01 });
  }
}

function update(lens, dt) {
  var s = lens.screen;
  var y = s.top * 0.3;
  dt = Math.min(dt, 0.05);
  var f = lens.face;
  if (f) {
    var target = 0.5 + (f.x - 0.5) * 2.2;
    shipX += (Math.max(0.07, Math.min(0.93, target)) - shipX) * Math.min(1, dt * 12);
  }
  if (state === "playing") {
    fire -= dt;
    if (fire <= 0) { lasers.push({ x: shipX, y: y + 0.06 }); fire = 0.3; lens.sound("laser", 0.35, lens.random(0.95, 1.1)); }
    waveTimer -= dt;
    if (aliens.length === 0 && waveTimer <= 0) { spawnWave(lens); waveTimer = 1.5; }
    bombCharge += dt;
    if (bombCharge >= 10) { bombCharge = 0; bomb = Math.min(2, bomb + 1); }
    var closed = f ? f.eyesClosed : false;
    if (closed && !wasClosed && bomb > 0 && aliens.length) {
      bomb--;
      for (var b = 0; b < aliens.length; b++) { lens.burst("💥", aliens[b].x, aliens[b].y, 1, "Explode", 0.12); score += 5; }
      aliens = []; lens.flash(0.6, 1, 0.8); lens.sound("boom");
    }
    wasClosed = closed;
  }
  for (var i = lasers.length - 1; i >= 0; i--) {
    var l = lasers[i];
    l.y += 1.6 * dt;
    var hit = false;
    for (var j = 0; j < aliens.length && !hit; j++) {
      var a = aliens[j];
      if (Math.abs(l.x - (a.x + Math.sin(a.phase) * 0.05)) < 0.07 && Math.abs(l.y - a.y) < 0.06) {
        hit = true; a.hp--;
        if (a.hp <= 0) { score += 10; lens.sound("pop", 0.8, lens.random(0.7, 1)); lens.burst(ALIENS[a.kind], a.x, a.y, 3, "Explode", 0.04); aliens.splice(j, 1); }
      }
    }
    if (hit || l.y > s.top) { lasers.splice(i, 1); continue; }
    lens.sprite("assets/laser.png", l.x, l.y, 0.018);
  }
  for (var k = aliens.length - 1; k >= 0; k--) {
    var al = aliens[k];
    if (state === "playing") { al.y -= al.speed * dt; al.phase += dt * 2; }
    var ax = al.x + Math.sin(al.phase) * 0.05;
    if (state === "playing" && al.y < s.top * 0.25) {
      aliens.splice(k, 1); lives--; lens.flash(1, 0.3, 0.3); lens.sound("buzz");
      if (lives <= 0) { state = "over"; endTime = lens.time; best = Math.max(best, score); }
      continue;
    }
    lens.sprite(ALIENS[al.kind], ax, al.y, al.hp > 1 ? 0.13 : 0.11, Math.sin(al.phase * 2) * 8);
  }
  lens.sprite("assets/ship.png", shipX, y, 0.12);
  var hearts = "";
  for (var h = 0; h < lives; h++) hearts += "❤️";
  var bombs = "";
  for (var q = 0; q < bomb; q++) bombs += "💣";
  lens.text(score + "  " + hearts + "  " + bombs, 0.5, s.top - 0.18, 0.06);
  if (state === "ready") lens.text("Tap to launch · blink for a bomb!", 0.5, s.top * 0.55, 0.05);
  if (state === "playing" && aliens.length === 0 && wave > 0) lens.text("Wave " + (wave + 1) + " incoming…", 0.5, s.top * 0.6, 0.06);
  if (state === "over") {
    lens.text("GAME OVER · " + score, 0.5, s.top * 0.6, 0.09);
    lens.text("Best " + best + " · tap to fly again", 0.5, s.top * 0.52, 0.05);
  }
}
