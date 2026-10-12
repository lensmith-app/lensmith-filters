// Flappy Face — open your mouth (or tap) to flap! Fly between the pipes.
var GRAVITY = -1.6;      // screen widths per second²
var FLAP = 0.75;         // upward speed after a flap
var SPEED = 0.35;        // how fast the pipes move
var GAP = 0.42;          // space between the top and bottom pipe
var BLOCK = 0.1;         // pipes are stacks of 🟩 blocks this wide

var bird, pipes, score, state, mouthWasOpen, endTime, nextPipe;

function start(lens) { reset(lens); }

function reset(lens) {
  bird = { x: 0.28, y: lens.screen.top * 0.55, vy: 0 };
  pipes = [];
  score = 0;
  state = "ready";
  nextPipe = 0;
  mouthWasOpen = false;
}

function flap(lens) {
  if (state === "ready") state = "playing";
  if (state === "playing") { bird.vy = FLAP; lens.sound("swish", 0.6, lens.random(1, 1.3)); }
  else if (state === "over" && lens.time - endTime > 1) reset(lens);
}

function tap(lens, x, y) { flap(lens); }

function update(lens, dt) {
  var s = lens.screen;
  var low = s.top * 0.2;   // keep clear of the camera controls
  var high = s.top - 0.15;
  dt = Math.min(dt, 0.05);

  var open = lens.face ? lens.face.mouthOpen > 0.35 : false;
  if (open && !mouthWasOpen) flap(lens);
  mouthWasOpen = open;

  if (state === "playing") {
    bird.vy += GRAVITY * dt;
    bird.y += bird.vy * dt;
    nextPipe -= dt;
    if (nextPipe <= 0) {
      pipes.push({ x: 1.15, gap: lens.random(low + GAP * 0.7, high - GAP * 0.7), scored: false });
      nextPipe = 1.9;
    }
    for (var i = pipes.length - 1; i >= 0; i--) {
      var p = pipes[i];
      p.x -= SPEED * dt;
      if (!p.scored && p.x < bird.x) { p.scored = true; score++; lens.sound("coin", 0.8); lens.burst("⭐", bird.x, bird.y, 5, "Explode", 0.04); }
      if (p.x < -0.2) pipes.splice(i, 1);
      else if (Math.abs(p.x - bird.x) < BLOCK * 0.5 + 0.035 && Math.abs(bird.y - p.gap) > GAP / 2 - 0.035) crash(lens);
    }
    if (bird.y < low || bird.y > high) crash(lens);
  }

  // Pipes.
  for (var j = 0; j < pipes.length; j++) {
    var q = pipes[j];
    for (var y = q.gap + GAP / 2 + BLOCK / 2; y < high + BLOCK; y += BLOCK) lens.sprite("🟩", q.x, y, BLOCK);
    for (var y2 = q.gap - GAP / 2 - BLOCK / 2; y2 > low - BLOCK; y2 -= BLOCK) lens.sprite("🟩", q.x, y2, BLOCK);
  }
  lens.sprite("🐤", bird.x, bird.y, 0.1, Math.max(-40, Math.min(30, bird.vy * 40)));

  lens.text(String(score), 0.5, s.top - 0.2, 0.12);
  if (state === "ready") lens.text("Open your mouth to flap!", 0.5, s.top * 0.4, 0.06);
  if (state === "over") {
    lens.text("GAME OVER", 0.5, s.top * 0.55, 0.12);
    if (lens.time - endTime > 1) lens.text("Open your mouth to play again", 0.5, s.top * 0.47, 0.05);
  }
}

function crash(lens) {
  if (state !== "playing") return;
  state = "over";
  endTime = lens.time;
  lens.sound("boom", 0.8);
  lens.sound("lose", 0.6);
  lens.burst("💥", bird.x, bird.y, 1, "Explode", 0.15);
  lens.flash(1, 0.3, 0.2);
}
