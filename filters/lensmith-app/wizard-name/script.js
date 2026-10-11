// Wizard Name — tap and the spellbook builds your wizard name from three random parts.
var TITLES = ["Archmage", "Grand Sorcerer", "Hedge Witch", "Apprentice", "Lord", "Lady", "Master", "Elder", "Professor", "Sir", "Dame", "High Druid"];
var FIRST = ["Bumble", "Moss", "Pickle", "Thistle", "Grim", "Sparkle", "Wobble", "Ember", "Fizz", "Toadstool", "Quill", "Crumpet", "Nimbus", "Biscuit", "Willow"];
var LAST = ["beard", "whisker", "wort", "bottom", "snout", "spark", "fern", "toes", "wick", "muffin", "cloak", "socks"];
var OF = ["of the Soggy Marsh", "the Mildly Powerful", "of the Lost Sock", "Breaker of Teacups", "the Fashionably Late",
  "of the Seventh Snack", "Who Talks to Pigeons", "the Unbothered", "of the Crooked Tower", "Keeper of the Remote"];

var state = "idle", t = 0, parts = ["", "", ""], locked = 0;

function pick(lens, list) { return list[Math.floor(lens.random(0, list.length))]; }

function tap(lens) {
  if (state === "spinning") return;
  state = "spinning"; t = 0; locked = 0;
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  var x = f ? f.x : 0.5;
  var y = f ? Math.min(f.y + f.width * 1.0, s.top - 0.45) : s.top * 0.65;
  if (state === "spinning") {
    t += dt;
    // Each part spins, then locks in one after another.
    if (locked < 1) parts[0] = pick(lens, TITLES);
    if (locked < 2) parts[1] = pick(lens, FIRST) + pick(lens, LAST);
    if (locked < 3) parts[2] = pick(lens, OF);
    if (t > 0.9 && locked === 0) { locked = 1; lens.sound("ding", 0.7); lens.burst("✨", 0.5, y + 0.12, 6, "Explode", 0.04); }
    if (t > 1.8 && locked === 1) { locked = 2; lens.sound("ding", 0.7, 1.2); lens.burst("✨", 0.5, y + 0.03, 6, "Explode", 0.04); }
    if (t > 2.7) { locked = 3; state = "done"; lens.sound("sparkle"); lens.flash(0.8, 0.6, 1); lens.burst("🪄", x, y, 1, "Explode", 0.15); }
  }
  if (f) lens.sprite("🧙", x + f.width * 0.55, f.y + f.width * 0.55, f.width * 0.25, -10, 0.9);
  lens.text("My wizard name is…", 0.5, s.top - 0.18, 0.06);
  if (state === "idle") { lens.text("🔮 Tap to find out!", 0.5, y, 0.06); return; }
  lens.text(parts[0], 0.5, y + 0.12, 0.055);
  lens.text(parts[1], 0.5, y + 0.03, 0.08);
  lens.text(parts[2], 0.5, y - 0.06, 0.05);
  if (state === "done") lens.text("Tap to try again", 0.5, y - 0.14, 0.04, 0.8);
}
