// Try Not To Smile — survive 20 seconds of silliness without smiling.
var LENGTH = 20;
var JOKES = ["🤡", "🦆", "🐸", "💩", "🥸", "🙃", "🐧", "🦄", "👅", "🤪"];
var LINES = ["Don't do it...", "Stay serious 😐", "Think about taxes", "Almost there!", "No smiling!", "Keep it together"];
var state = "ready", t = 0, nextJoke = 0, line = 0;

function tap(lens) {
  if (state !== "playing") { state = "playing"; t = 0; nextJoke = 0.5; lens.popup("Go! 😐"); }
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  if (state === "playing") {
    t += dt;
    nextJoke -= dt;
    if (nextJoke <= 0) {
      var e = JOKES[Math.floor(lens.random(0, JOKES.length))];
      if (f) lens.burst(e, f.x + lens.random(-0.3, 0.3), f.y + f.width * 0.8, 1, "Fountain", 0.14);
      else lens.burst(e, lens.random(0.2, 0.8), s.top * 0.5, 1, "Fountain", 0.14);
      line = Math.floor(lens.random(0, LINES.length));
      nextJoke = lens.random(0.8, 1.6);
    }
    if (f && f.smiling) {
      state = "lost";
      lens.burst("😂", f.x, f.y, 16, "Explode", 0.1);
      lens.flash(1, 0.5, 0.5);
    } else if (t >= LENGTH) {
      state = "won";
      lens.burst("🏆", 0.5, s.top * 0.6, 1, "Explode", 0.25);
      lens.flash(1, 0.9, 0.4);
    }
  }
  var bar = Math.max(0, 1 - t / LENGTH);
  lens.text("Try Not To Smile", 0.5, s.top - 0.18, 0.07);
  if (state === "ready") lens.text("Tap to start 😐", 0.5, s.top - 0.28, 0.055);
  if (state === "playing") {
    lens.text(Math.ceil(LENGTH - t) + "", 0.5, s.top - 0.32, 0.12);
    lens.text(LINES[line], 0.5, s.top * 0.3, 0.055, 0.9);
    for (var i = 0; i < 10; i++) lens.sprite(i < bar * 10 ? "🟨" : "⬛", 0.23 + i * 0.06, s.top - 0.42, 0.05, 0, 0.9);
  }
  if (state === "lost") { lens.text("YOU SMILED! 😂", 0.5, s.top * 0.55, 0.1); lens.text("Tap to try again", 0.5, s.top * 0.48, 0.05); }
  if (state === "won") { lens.text("STONE FACE 🗿", 0.5, s.top * 0.55, 0.1); lens.text("Tap to play again", 0.5, s.top * 0.48, 0.05); }
}
