// My prediction for next year — a randomizer: tap and it spins through the options above your head, then picks one.
var TITLE = "My prediction for next year";
var OPTIONS = [
  ["💰", "You get rich"],
  ["💘", "You fall in love"],
  ["✈️", "Big trip abroad"],
  ["🐶", "You get a pet"],
  ["🏠", "You move house"],
  ["📈", "You go viral"],
  ["💍", "Someone proposes"],
  ["🎓", "You learn something new"],
  ["🍀", "Lucky all year"],
  ["😴", "Lots of naps"]
];

var state = "idle";   // idle -> spinning -> done
var shown = 0;
var spinTime = 0;
var nextFlip = 0;
var pick = 0;

function tap(lens, x, y) {
  if (state === "spinning") return;
  state = "spinning";
  spinTime = 0;
  nextFlip = 0;
  pick = Math.floor(lens.random(0, OPTIONS.length));
}

function update(lens, dt) {
  var s = lens.screen;
  if (state === "spinning") {
    spinTime += dt;
    nextFlip -= dt;
    if (nextFlip <= 0) {
      shown = (shown + 1 + Math.floor(lens.random(0, OPTIONS.length - 1))) % OPTIONS.length;
      // Flips slow down as the spin goes on.
      nextFlip = 0.06 + spinTime * spinTime * 0.05;
    }
    if (spinTime > 3) {
      shown = pick;
      state = "done";
      lens.flash(1, 1, 1);
    }
  } else if (state === "done") {
    spinTime += dt;
  }

  // Above the head when there's a face, otherwise near the top of the screen.
  var f = lens.face;
  var x = f ? f.x : 0.5;
  var y = f ? Math.min(f.y + f.width * 1.05, s.top - 0.42) : s.top * 0.68;
  var size = f ? Math.max(0.16, Math.min(0.3, f.width * 0.45)) : 0.22;

  lens.text(TITLE, 0.5, s.top - 0.2, 0.065);
  if (state === "idle") {
    lens.sprite("❔", x, y, size);
    lens.text("Tap to find out!", x, y - size * 0.75, 0.05);
    return;
  }
  var o = OPTIONS[shown];
  var pop = state === "done" ? 1 + 0.15 * Math.max(0, 1 - (spinTime - 3) * 4) : 1;
  lens.sprite(o[0], x, y + size * 0.15, size * pop);
  lens.text(o[1], x, y - size * 0.6, 0.06);
  if (state === "done") {
    if (spinTime < 3.05) lens.burst("✨", x, y, 14, "Explode", 0.05);
    lens.text("Tap to try again", x, y - size * 0.6 - 0.08, 0.04, 0.8);
  }
}
