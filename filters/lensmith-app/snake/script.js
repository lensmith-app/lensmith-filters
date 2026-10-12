// Snake — tilt your head left or right to turn (or tap the left/right side). Eat apples, don't
// hit the walls or yourself!
var SEG = 0.045;
var path = [], length = 6, angle = 90, x = 0.5, y = 1, apple = null, score = 0, state = "ready", best = 0, endTime = 0;

function lean(f) {
  var a = f.anchors.LeftEye, b = f.anchors.RightEye;
  var l = a.x < b.x ? a : b, r = a.x < b.x ? b : a;
  var d = (r.y - l.y) / f.width;
  if (d > 0.1) return -1;
  if (d < -0.1) return 1;
  return 0;
}

function place(lens) {
  var s = lens.screen;
  apple = { x: lens.random(0.12, 0.88), y: lens.random(s.top * 0.3, s.top - 0.35) };
}

function reset(lens) {
  var s = lens.screen;
  x = 0.5; y = s.top * 0.32; angle = 90; length = 6; score = 0; path = [];
  for (var i = 0; i < 60; i++) path.push({ x: x, y: y - i * 0.01 });
  place(lens);
}

var tapTurn = 0;
function tap(lens, tx) {
  if (state !== "playing") {
    if (state === "over" && lens.time - endTime < 0.8) return;
    reset(lens); state = "playing"; lens.music("arcade", 0.3); return;
  }
  tapTurn = tx < 0.5 ? 1 : -1;
}

function update(lens, dt) {
  var s = lens.screen;
  var bottom = s.top * 0.25, top = s.top - 0.28;
  dt = Math.min(dt, 0.05);
  if (state === "ready" && !apple) reset(lens);
  if (state === "playing") {
    var turn = tapTurn * 25;
    tapTurn = 0;
    if (lens.face) turn += -lean(lens.face) * 160 * dt;   // lean left -> turn left (counter-clockwise)
    angle += turn;
    var speed = 0.2 + score * 0.006;
    var rad = angle * Math.PI / 180;
    x += Math.cos(rad) * speed * dt;
    y += Math.sin(rad) * speed * dt;
    var last = path[0];
    if (Math.abs(x - last.x) + Math.abs(y - last.y) > 0.008) path.unshift({ x: x, y: y });
    if (path.length > 400) path.length = 400;
    if (Math.abs(x - apple.x) < 0.05 && Math.abs(y - apple.y) < 0.05) {
      score++; length += 3; lens.sound("chomp", 0.9, lens.random(0.9, 1.2)); lens.burst("✨", apple.x, apple.y, 8, "Explode", 0.04); place(lens);
    }
    var dead = x < 0.03 || x > 0.97 || y < bottom || y > top;
    // Self collision: any body segment (skipping the neck) close to the head.
    for (var i = 1; i < length && !dead; i++) {
      var p = path[Math.min(path.length - 1, i * 6)];
      if (i > 3 && Math.abs(p.x - x) < SEG * 0.6 && Math.abs(p.y - y) < SEG * 0.6) dead = true;
    }
    if (dead) { state = "over"; lens.music(null); lens.sound("lose"); endTime = lens.time; best = Math.max(best, score); lens.flash(1, 0.4, 0.4); }
  }
  // Arena border.
  for (var bx = 0; bx < 11; bx++) {
    lens.sprite("assets/body.png", bx * 0.1, bottom - 0.02, 0.02, 0, 0.35);
    lens.sprite("assets/body.png", bx * 0.1, top + 0.02, 0.02, 0, 0.35);
  }
  if (apple) lens.sprite("assets/apple.png", apple.x, apple.y + Math.sin(lens.time * 4) * 0.005, 0.07);
  for (var j = length - 1; j >= 1; j--) {
    var q = path[Math.min(path.length - 1, j * 6)];
    lens.sprite("assets/body.png", q.x, q.y, SEG * (1 - j / (length * 2.5)));
  }
  lens.sprite("assets/head.png", x, y, SEG * 1.35, angle - 90);
  lens.text("🍎 " + score, 0.5, s.top - 0.18, 0.08);
  if (state === "ready") lens.text("Tap to start · tilt your head to turn", 0.5, s.top * 0.6, 0.05);
  if (state === "over") {
    lens.text("Game over · " + score + " apples", 0.5, s.top * 0.6, 0.075);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.53, 0.045);
  }
}
