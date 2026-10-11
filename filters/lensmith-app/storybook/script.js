// Storybook — tap and on-device AI paints you as a hand-drawn storybook character, framed like a
// page from a fairy tale. Tap again to go back.
var OPENINGS = [
  "Once upon a time…", "In a land far, far away…", "Long ago, in a cozy little town…",
  "Once, on a very ordinary Tuesday…", "Deep in the enchanted forest…"
];
var state = "live", picture = null, shownAt = 0, line = "";

function tap(lens) {
  if (state === "showing") { state = "live"; picture = null; return; }
  if (state !== "live") return;
  line = OPENINGS[Math.floor(lens.random(0, OPENINGS.length))];
  var ok = lens.stylize("cartoon-handdrawn", function (lens, art, error) {
    if (!art) { state = "live"; lens.popup(error || "Couldn't paint you"); return; }
    picture = art; state = "showing"; shownAt = lens.time; lens.flash(1, 0.95, 0.8);
  });
  if (ok) state = "painting";
}

function frame(lens) {
  var s = lens.screen;
  // A border of vines and flowers around the page.
  var art = ["🌿", "🌸", "🍃", "🌼"];
  for (var i = 0; i < 9; i++) {
    lens.sprite(art[i % 4], 0.04, s.top * (0.22 + i * 0.09), 0.08, i * 40, 0.95);
    lens.sprite(art[(i + 2) % 4], 0.96, s.top * (0.22 + i * 0.09), 0.08, -i * 40, 0.95);
  }
  for (var j = 0; j < 9; j++) lens.sprite(art[j % 4], 0.1 + j * 0.1, s.top - 0.06, 0.08, j * 30, 0.95);
}

function update(lens, dt) {
  var s = lens.screen;
  if (state === "showing") {
    var k = Math.min(1, (lens.time - shownAt) / 0.6);
    lens.sprite(picture, 0.5, s.top / 2, 1, 0, k);
    frame(lens);
    lens.text(line, 0.5, s.top - 0.18, 0.07, k);
    lens.text("Tap to close the book", 0.5, s.top * 0.27, 0.04, 0.8);
    return;
  }
  if (state === "painting") {
    var dots = ["", ".", "..", "..."][Math.floor(lens.time * 3) % 4];
    lens.text("Painting your page" + dots, 0.5, s.top * 0.35, 0.055);
    frame(lens);
    return;
  }
  lens.text("📖 Storybook", 0.5, s.top - 0.2, 0.065);
  lens.text("Tap to become a storybook character", 0.5, s.top * 0.35, 0.05);
}
