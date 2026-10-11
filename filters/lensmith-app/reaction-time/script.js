// Reaction Time — wait for green, then tap as fast as you can.
var state = "ready", waitLeft = 0, shownAt = 0, result = 0, best = 0;

function tap(lens) {
  if (state === "ready" || state === "result" || state === "early") {
    state = "waiting"; waitLeft = lens.random(1.5, 4);
  } else if (state === "waiting") {
    state = "early"; lens.flash(1, 0.3, 0.3);
  } else if (state === "go") {
    result = Math.round((lens.time - shownAt) * 1000);
    best = best ? Math.min(best, result) : result;
    state = "result";
    lens.burst("⚡", 0.5, lens.screen.top * 0.6, 10, "Explode", 0.06);
  }
}

function update(lens, dt) {
  var s = lens.screen;
  var mid = s.top * 0.6;
  if (state === "waiting") {
    waitLeft -= dt;
    if (waitLeft <= 0) { state = "go"; shownAt = lens.time; }
  }
  lens.text("Reaction Time", 0.5, s.top - 0.18, 0.07);
  if (state === "ready") lens.text("Tap to start, then tap on 🟢", 0.5, mid, 0.055);
  if (state === "waiting") { lens.sprite("🔴", 0.5, mid, 0.3); lens.text("Wait for it…", 0.5, mid - 0.25, 0.06); }
  if (state === "go") { lens.sprite("🟢", 0.5, mid, 0.34); lens.text("TAP!", 0.5, mid - 0.25, 0.1); }
  if (state === "early") { lens.text("Too early! 😅", 0.5, mid, 0.08); lens.text("Tap to try again", 0.5, mid - 0.1, 0.05); }
  if (state === "result") {
    var verdict = result < 250 ? "Lightning! ⚡" : result < 350 ? "Sharp! 🎯" : result < 500 ? "Not bad 🙂" : "Sleepy… 😴";
    lens.text(result + " ms", 0.5, mid, 0.12);
    lens.text(verdict, 0.5, mid - 0.12, 0.06);
    lens.text("Best " + best + " ms · tap to go again", 0.5, mid - 0.21, 0.045);
  }
}
