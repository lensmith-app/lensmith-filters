// Anime Snap — tap, strike a pose during the countdown, and on-device AI redraws you as an anime
// character. Tap again to go back to the camera.
var state = "live", count = 0, picture = null, shownAt = 0;

function tap(lens) {
  if (state === "showing") { state = "live"; picture = null; return; }
  if (state === "live") { state = "counting"; count = 3.2; }
}

function update(lens, dt) {
  var s = lens.screen;
  if (state === "counting") {
    count -= dt;
    var n = Math.ceil(count - 0.2);
    if (n > 0) lens.text(String(n), 0.5, s.top * 0.6, 0.35, Math.min(1, (count - n + 0.2) * 3));
    if (count <= 0) {
      lens.flash(1, 1, 1);
      var ok = lens.stylize("cartoon-anime", function (lens, art, error) {
        if (!art) { state = "live"; lens.popup(error || "Couldn't draw you"); return; }
        picture = art; state = "showing"; shownAt = lens.time;
        lens.burst("🌸", 0.5, s.top * 0.8, 16, "Rain", 0.06);
      });
      state = ok ? "drawing" : "live";
    }
    return;
  }
  if (state === "drawing") {
    var dots = ["", ".", "..", "..."][Math.floor(lens.time * 3) % 4];
    lens.text("Drawing you" + dots, 0.5, s.top * 0.35, 0.06);
    if (Math.random() < 0.2) lens.burst("🌸", lens.random(0.1, 0.9), s.top * 0.9, 1, "Rain", 0.05);
    return;
  }
  if (state === "showing") {
    lens.sprite(picture, 0.5, s.top / 2, 1, 0, Math.min(1, (lens.time - shownAt) / 0.4));
    lens.text("Tap to go back", 0.5, s.top * 0.3, 0.045, 0.8);
    return;
  }
  lens.text("🌸 Anime Snap 🌸", 0.5, s.top - 0.2, 0.065);
  lens.text("Tap, then strike a pose!", 0.5, s.top * 0.35, 0.06);
}
