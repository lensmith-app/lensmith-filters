// This or That — tilt your head toward the one you'd pick. Tap to start a new round.
var QUESTIONS = [
  ["🍕", "Pizza", "🍔", "Burger"], ["🐶", "Dogs", "🐱", "Cats"], ["🏖️", "Beach", "🏔️", "Mountains"],
  ["☕", "Coffee", "🍵", "Tea"], ["🌅", "Sunrise", "🌙", "Night owl"], ["🎮", "Games", "📚", "Books"],
  ["🍦", "Ice cream", "🍰", "Cake"], ["✈️", "Fly", "🚗", "Road trip"], ["🎬", "Movies", "📺", "Shows"],
  ["🌮", "Tacos", "🍣", "Sushi"], ["❄️", "Winter", "☀️", "Summer"], ["🎧", "Music", "🎙️", "Podcasts"],
  ["🧁", "Sweet", "🧂", "Salty"], ["🏙️", "City", "🌲", "Forest"], ["🐉", "Dragons", "🦄", "Unicorns"]
];
var ROUND = 8;
var order = [], index = 0, picks = [], state = "ready", hold = 0, side = 0, cooldown = 0;

function lean(f) {
  var a = f.anchors.LeftEye, b = f.anchors.RightEye;
  var l = a.x < b.x ? a : b, r = a.x < b.x ? b : a;
  var d = (r.y - l.y) / f.width;
  if (d > 0.12) return -1;
  if (d < -0.12) return 1;
  return 0;
}

function tap(lens) {
  if (state === "playing") return;
  order = QUESTIONS.slice();
  for (var i = order.length - 1; i > 0; i--) {
    var j = Math.floor(lens.random(0, i + 1));
    var t = order[i]; order[i] = order[j]; order[j] = t;
  }
  order = order.slice(0, ROUND);
  index = 0; picks = []; state = "playing"; cooldown = 0.5;
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  var cy = s.top * 0.62;
  if (state === "playing") {
    var q = order[index];
    cooldown -= dt;
    var l = f ? lean(f) : 0;
    if (l !== 0 && l === side && cooldown <= 0) hold += dt; else hold = 0;
    side = l;
    if (hold > 0.35) {
      var pick = l < 0 ? q[0] : q[2];
      picks.push(pick);
      lens.sound("swish");
      lens.burst(pick, l < 0 ? 0.22 : 0.78, cy, 6, "Explode", 0.06);
      index++; hold = 0; cooldown = 0.6;
      if (index >= order.length) { state = "done"; lens.flash(1, 0.95, 0.7); lens.sound("sparkle"); }
    }
    if (state === "playing") {
      q = order[index];
      var pulseL = side < 0 ? 1.15 : 1, pulseR = side > 0 ? 1.15 : 1;
      lens.sprite(q[0], 0.22, cy, 0.2 * pulseL);
      lens.text(q[1], 0.22, cy - 0.15, 0.05);
      lens.sprite(q[2], 0.78, cy, 0.2 * pulseR);
      lens.text(q[3], 0.78, cy - 0.15, 0.05);
      lens.text("or", 0.5, cy, 0.06, 0.8);
      lens.text((index + 1) + " / " + order.length, 0.5, s.top - 0.27, 0.05, 0.85);
    }
  }
  lens.text("This or That?", 0.5, s.top - 0.18, 0.07);
  if (state === "ready") lens.text("Tap, then tilt your head to pick", 0.5, s.top - 0.27, 0.05);
  // Picks so far, in a row near the top.
  for (var i = 0; i < picks.length; i++) lens.sprite(picks[i], 0.5 + (i - (picks.length - 1) / 2) * 0.1, s.top - 0.4, 0.08);
  if (state === "done") lens.text("My picks! Tap for a new round", 0.5, s.top - 0.5, 0.05);
}
