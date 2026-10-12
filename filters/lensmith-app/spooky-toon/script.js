// Spooky Toon — tap and on-device AI redraws you as a hand-drawn cartoon, under a full moon
// with bats and creeping fog. Tap again to go back.
var state = "live", picture = null, shownAt = 0, sparkle = 0, bats = [];

function tap(lens) {
  if (state === "working") return;
  if (state === "showing") { state = "live"; picture = null; lens.music(null); return; }
  if (!lens.face) lens.popup("Face the camera for the full effect");
  var started = lens.stylize("cartoon-handdrawn", function (lens, art, error) {
    if (!art) { state = "live"; lens.popup(error || "Couldn't draw you"); return; }
    picture = art; state = "showing"; shownAt = lens.time;
    lens.flash(0.6, 1, 0.6);
    lens.sound("assets/boo.ogg", 0.8);
    lens.music("assets/spooky-loop.ogg", 0.35);
    bats = [];
    for (var i = 0; i < 6; i++) bats.push({ x: lens.random(0, 1), y: lens.random(0.55, 0.95), v: lens.random(0.08, 0.16), wob: lens.random(0, 6) });
  });
  if (started) state = "working";
}

function update(lens, dt) {
  var s = lens.screen, f = lens.face;
  dt = Math.min(dt, 0.05);
  if (state === "showing") {
    var k = Math.min(1, (lens.time - shownAt) / 0.6);
    lens.sprite(picture, 0.5, s.top / 2, 1, 0, k);
    // The haunted scene on top: moon, fog and bats.
    lens.sprite("assets/moon.png", 0.8, s.top - 0.24, 0.26, 0, 0.9 * k);
    lens.sprite("assets/fog.png", 0.5 + Math.sin(lens.time * 0.25) * 0.06, s.top * 0.18, 1.5, 0, 0.9 * k);
    for (var i = 0; i < bats.length; i++) {
      var b = bats[i];
      b.x += b.v * dt;
      if (b.x > 1.15) b.x = -0.15;
      lens.sprite(Math.floor(lens.time * 9 + i) % 2 ? "assets/bat1.png" : "assets/bat2.png", b.x, s.top * b.y + Math.sin(lens.time * 3 + b.wob) * 0.03, 0.1, 0, k);
    }
    lens.text("🎃 Happy Halloween 🎃", 0.5, s.top * 0.36, 0.07, k);
    lens.text("Tap to go back", 0.5, s.top * 0.3, 0.045, 0.8 * k);
    return;
  }
  if (state === "working") {
    sparkle -= dt;
    if (sparkle <= 0) {
      sparkle = 0.18;
      var cx = f ? f.x : 0.5, cy = f ? f.y : s.top / 2, r = f ? f.width * 0.7 : 0.3, a = lens.random(0, Math.PI * 2);
      lens.burst("🦇", cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, "Explode", 0.08);
    }
    lens.text("Summoning" + ["", ".", "..", "..."][Math.floor(lens.time * 3) % 4], 0.5, s.top * 0.3, 0.06);
    return;
  }
  lens.sprite("assets/moon.png", 0.8, s.top - 0.24, 0.2, 0, 0.8);
  lens.text("🎃 Spooky Toon 🎃", 0.5, s.top - 0.2, 0.065);
  lens.text("Tap to turn into a spooky cartoon", 0.5, s.top * 0.3, 0.055);
}
