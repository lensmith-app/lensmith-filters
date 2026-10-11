// Rate My Vibe — tap and the vibe meter spins to a score with a verdict. Smiling helps. A lot.
var VERDICTS = [
  [3, ["Needs coffee ☕", "Monday energy 🥱", "Running on 2% 🔋"]],
  [6, ["Solid vibes 👍", "Chill and certified 😎", "Main character in training 🎬"]],
  [8, ["Immaculate vibes ✨", "Radiating good energy 🌈", "Certified fresh 🍃"]],
  [10, ["OFF THE CHARTS 🚀", "Legendary aura 👑", "The vibe IS you 🔥"]]
];
var state = "idle", t = 0, shown = 5, score = 5, verdict = "";

function tap(lens) {
  if (state === "spinning") return;
  var f = lens.face;
  var bonus = f && f.smiling ? 2 : 0;
  score = Math.min(10, Math.max(1, Math.round(lens.random(2, 9) + bonus)));
  for (var i = 0; i < VERDICTS.length; i++) {
    if (score <= VERDICTS[i][0]) { var v = VERDICTS[i][1]; verdict = v[Math.floor(lens.random(0, v.length))]; break; }
  }
  state = "spinning"; t = 0;
  lens.sound("whoosh", 0.6);
}

function update(lens, dt) {
  var s = lens.screen;
  var y = s.top - 0.42;
  if (state === "spinning") {
    t += dt;
    shown = 1 + Math.floor(Math.abs(Math.sin(t * (9 - t * 2.5))) * 9.99);
    if (t > 2.4) { shown = score; state = "done"; lens.sound(score >= 9 ? "powerup" : "ding"); if (score >= 9) lens.burst("🔥", 0.5, y, 12, "Explode", 0.07); lens.flash(1, 1, 1); }
  }
  lens.text("Vibe check", 0.5, s.top - 0.18, 0.065);
  if (state === "idle") { lens.text("Tap to rate your vibe", 0.5, s.top - 0.27, 0.05); return; }
  // Meter: 10 blocks filling up to the score.
  for (var i = 0; i < 10; i++) {
    var art = i < shown ? (shown >= 8 ? "🟪" : shown >= 5 ? "🟩" : "🟧") : "⬛";
    lens.sprite(art, 0.23 + i * 0.06, y, 0.05, 0, 0.95);
  }
  lens.text(shown + " / 10", 0.5, y - 0.1, 0.09);
  if (state === "done") {
    lens.text(verdict, 0.5, y - 0.2, 0.06);
    lens.text("Tap to re-check", 0.5, y - 0.28, 0.04, 0.8);
  }
}
