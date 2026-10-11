// Simon Says Face — do the face before time runs out! It gets faster every round.
var MOVES = [
  ["smile", "Smile! 😁"], ["mouth", "Open your mouth! 😮"], ["blink", "Close your eyes! 😌"],
  ["left", "Tilt left! ↖️"], ["right", "Tilt right! ↗️"]
];
var state = "ready", move = null, timeLeft = 0, limit = 3, score = 0, best = 0, hold = 0, endTime = 0;

// Which way the head leans, as seen on screen: -1 left, 1 right, 0 straight.
function lean(f) {
  var a = f.anchors.LeftEye, b = f.anchors.RightEye;
  var l = a.x < b.x ? a : b, r = a.x < b.x ? b : a;
  var d = (r.y - l.y) / f.width;
  if (d > 0.12) return -1;
  if (d < -0.12) return 1;
  return 0;
}

function doing(f, id) {
  if (!f) return false;
  if (id === "smile") return f.smiling;
  if (id === "mouth") return f.mouthOpen > 0.4;
  if (id === "blink") return f.eyesClosed;
  if (id === "left") return lean(f) === -1;
  return lean(f) === 1;
}

function nextMove(lens) {
  var m;
  do { m = MOVES[Math.floor(lens.random(0, MOVES.length))]; } while (move && m[0] === move[0]);
  move = m; timeLeft = limit; hold = 0;
}

function tap(lens) {
  if (state === "playing" || (state === "over" && lens.time - endTime < 0.8)) return;
  state = "playing"; score = 0; limit = 3; move = null; nextMove(lens);
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  if (state === "playing") {
    timeLeft -= dt;
    if (doing(f, move[0])) hold += dt; else hold = 0;
    if (hold > 0.25) {
      score++; limit = Math.max(1.2, limit * 0.93);
      lens.burst("✅", 0.5, s.top * 0.6, 1, "Explode", 0.12);
      nextMove(lens);
    } else if (timeLeft <= 0) {
      state = "over"; endTime = lens.time; best = Math.max(best, score);
      lens.flash(1, 0.4, 0.4);
    }
  }
  lens.text("Simon Says…", 0.5, s.top - 0.18, 0.065);
  if (state === "ready") lens.text("Tap to start", 0.5, s.top - 0.27, 0.055);
  if (state === "playing") {
    lens.text(move[1], 0.5, s.top - 0.29, 0.085);
    var bar = Math.max(0, timeLeft / limit);
    for (var i = 0; i < 10; i++) lens.sprite(i < bar * 10 ? "🟩" : "⬛", 0.23 + i * 0.06, s.top - 0.4, 0.05, 0, 0.9);
    lens.text("Score " + score, 0.5, s.top - 0.47, 0.05);
  }
  if (state === "over") {
    lens.text("Too slow! Score " + score, 0.5, s.top - 0.29, 0.08);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top - 0.37, 0.045);
  }
}
