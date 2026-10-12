// Rhythm Tap — gems fall down three lanes. Tap the lane as each gem crosses the ring!
// Perfect timing builds your combo.
var LANES = [0.22, 0.5, 0.78];
var GEMS = ["assets/gem-pink.png", "assets/gem-blue.png", "assets/gem-yellow.png"];
var BPM = 112, NOTES = 48, FALL = 1.4;     // seconds a gem takes to fall to the ring
var notes = [], t = 0, score = 0, combo = 0, maxCombo = 0, hits = 0, state = "ready", feedback = "", feedbackTime = -9, pulse = 0, best = 0;
var ringFlash = [0, 0, 0];

function build(lens) {
  notes = [];
  var beat = 60 / BPM, time = 2, lane = 1;
  for (var i = 0; i < NOTES; i++) {
    lane = (lane + 1 + Math.floor(lens.random(0, 2))) % 3;
    notes.push({ time: time, lane: lane, done: false });
    // Mostly on the beat, sometimes a quick double.
    time += Math.random() < 0.2 ? beat / 2 : beat;
  }
}

function judge(lens, lane) {
  var best = null, bestErr = 9;
  for (var i = 0; i < notes.length; i++) {
    var n = notes[i];
    if (n.done || n.lane !== lane) continue;
    var err = Math.abs(n.time - t);
    if (err < bestErr) { bestErr = err; best = n; }
  }
  ringFlash[lane] = 0.15;
  if (!best || bestErr > 0.22) { lens.sound("click", 0.5); combo = 0; feedback = "Miss"; feedbackTime = lens.time; return; }
  best.done = true; hits++;
  combo++; maxCombo = Math.max(maxCombo, combo);
  var perfect = bestErr < 0.08;
  lens.sound(perfect ? "hihat" : "snare", perfect ? 1 : 0.8);
  score += (perfect ? 100 : 50) * (1 + Math.floor(combo / 10));
  feedback = perfect ? "Perfect!" : "Good"; feedbackTime = lens.time;
  lens.burst(perfect ? "✨" : "💫", LANES[lane], lens.screen.top * 0.32, perfect ? 8 : 4, "Explode", 0.04);
}

function tap(lens, x) {
  if (state !== "playing") { build(lens); t = 0; score = 0; combo = 0; maxCombo = 0; hits = 0; state = "playing"; lens.music("beat", 0.45); return; }
  judge(lens, x < 0.36 ? 0 : x < 0.64 ? 1 : 2);
}

function update(lens, dt) {
  var s = lens.screen;
  var ringY = s.top * 0.32, topY = s.top - 0.3;
  if (state === "playing") {
    t += dt;
    var beat = 60 / BPM;
    pulse = 1 - (t % beat) / beat;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      if (!n.done && t - n.time > 0.22) { n.done = true; combo = 0; feedback = "Miss"; feedbackTime = lens.time; }
    }
    if (t > notes[notes.length - 1].time + 1) { state = "over"; lens.music(null); lens.sound("win"); best = Math.max(best, score); lens.flash(1, 0.9, 0.6); }
  }
  for (var l = 0; l < 3; l++) {
    ringFlash[l] = Math.max(0, ringFlash[l] - dt);
    lens.sprite("assets/ring.png", LANES[l], ringY, 0.17 * (1 + pulse * 0.06 + ringFlash[l]), 0, 0.8);
    for (var d = 0; d < 7; d++) lens.sprite("assets/ring.png", LANES[l], ringY + 0.15 + d * (topY - ringY - 0.15) / 6, 0.02, 0, 0.35);
  }
  if (state === "playing") {
    for (var j = 0; j < notes.length; j++) {
      var nt = notes[j];
      var k = (nt.time - t) / FALL;            // 1 = top of the lane, 0 = at the ring
      if (nt.done || k > 1 || k < -0.3) continue;
      lens.sprite(GEMS[nt.lane], LANES[nt.lane], ringY + k * (topY - ringY), 0.13, 0, k < 1 ? 1 : 0);
    }
  }
  lens.text(String(score), 0.5, s.top - 0.18, 0.09);
  if (combo >= 3) lens.text("Combo x" + combo, 0.5, s.top - 0.26, 0.05);
  if (lens.time - feedbackTime < 0.5) lens.text(feedback, 0.5, ringY + 0.13, 0.06);
  if (state === "ready") lens.text("Tap to start · tap the lanes on the beat", 0.5, s.top * 0.6, 0.05);
  if (state === "over") {
    lens.text(hits + " / " + notes.length + " hit · max combo " + maxCombo, 0.5, s.top * 0.6, 0.06);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.53, 0.045);
  }
}
