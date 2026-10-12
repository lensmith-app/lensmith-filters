// Brick Breaker — move your head left and right to slide the paddle. Clear every brick!
var COLS = 6, ROWS = 5;
var BRICKS = { red: "assets/brick-red.png", gold: "assets/brick-gold.png", green: "assets/brick-green.png", blue: "assets/brick-blue.png" };
var COLORS = ["red", "gold", "green", "blue", "red"];
var BW = 0.15, BH = BW * 70 / 160;
var bricks = [], ball, paddleX = 0.5, lives = 3, score = 0, state = "ready", level = 1, endTime = 0;

function build(lens) {
  var s = lens.screen;
  bricks = [];
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      bricks.push({ x: 0.5 + (c - (COLS - 1) / 2) * (BW + 0.005), y: s.top - 0.32 - r * (BH + 0.01), color: COLORS[r], alive: true });
    }
  }
}

function serve(lens) {
  ball = { x: paddleX, y: lens.screen.top * 0.33, vx: lens.random(-0.3, 0.3), vy: 0.75 + level * 0.05, stuck: true };
}

function tap(lens) {
  if (state === "ready" || (state === "over" && lens.time - endTime > 0.8)) {
    lives = 3; score = 0; level = 1; build(lens); serve(lens); state = "playing"; lens.music("arcade", 0.3); return;
  }
  if (state === "won") { level++; build(lens); serve(lens); state = "playing"; return; }
  if (ball && ball.stuck) ball.stuck = false;
}

function update(lens, dt) {
  var s = lens.screen;
  var py = s.top * 0.3, pw = 0.26, R = 0.022;
  dt = Math.min(dt, 0.04);
  if (lens.face) {
    var target = 0.5 + (lens.face.x - 0.5) * 2.2;
    paddleX += (Math.max(pw / 2, Math.min(1 - pw / 2, target)) - paddleX) * Math.min(1, dt * 14);
  }
  if (state === "playing") {
    if (ball.stuck) { ball.x = paddleX; ball.y = py + 0.04; }
    else {
      for (var step = 0; step < 3; step++) {
        var h = dt / 3;
        ball.x += ball.vx * h; ball.y += ball.vy * h;
        if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx); }
        if (ball.x > 1 - R) { ball.x = 1 - R; ball.vx = -Math.abs(ball.vx); }
        if (ball.y > s.top - 0.12) { ball.y = s.top - 0.12; ball.vy = -Math.abs(ball.vy); }
        // Paddle: the further from the centre you hit it, the sharper the bounce.
        if (ball.vy < 0 && ball.y < py + 0.03 && ball.y > py - 0.02 && Math.abs(ball.x - paddleX) < pw / 2 + R) {
          var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          var a = (ball.x - paddleX) / (pw / 2) * 1.0;
          ball.vx = Math.sin(a) * speed; ball.vy = Math.cos(a) * speed;
        }
        for (var i = 0; i < bricks.length; i++) {
          var b = bricks[i];
          if (!b.alive) continue;
          if (Math.abs(ball.x - b.x) < BW / 2 + R && Math.abs(ball.y - b.y) < BH / 2 + R) {
            b.alive = false; score += 10; lens.sound("pop", 0.8, lens.random(0.9, 1.4));
            lens.burst(BRICKS[b.color], b.x, b.y, 3, "Explode", 0.04);
            if (Math.abs(ball.x - b.x) / BW > Math.abs(ball.y - b.y) / BH) ball.vx = -ball.vx; else ball.vy = -ball.vy;
            ball.vx *= 1.01; ball.vy *= 1.01;
            break;
          }
        }
      }
      if (ball.y < s.top * 0.2) {
        lives--;
        lens.sound("buzz");
        lens.flash(1, 0.4, 0.4);
        if (lives <= 0) { state = "over"; endTime = lens.time; lens.music(null); lens.sound("lose"); } else serve(lens);
      }
      var left = 0;
      for (var k = 0; k < bricks.length; k++) if (bricks[k].alive) left++;
      if (left === 0) { state = "won"; lens.sound("win"); lens.flash(1, 0.9, 0.5); lens.burst("⭐", 0.5, s.top * 0.6, 16, "Explode", 0.06); }
    }
  }
  if (bricks.length === 0) build(lens);
  for (var j = 0; j < bricks.length; j++) if (bricks[j].alive) lens.sprite(BRICKS[bricks[j].color], bricks[j].x, bricks[j].y, BW);
  lens.sprite("assets/paddle.png", paddleX, py, pw);
  if (ball && state === "playing") lens.sprite("assets/ball.png", ball.x, ball.y, R * 2.2);
  var hearts = "";
  for (var l = 0; l < lives; l++) hearts += "❤️";
  lens.text(score + "   " + hearts, 0.5, s.top - 0.18, 0.065);
  if (state === "ready") lens.text("Tap to start · move your head to steer", 0.5, s.top * 0.45, 0.05);
  if (state === "playing" && ball.stuck) lens.text("Tap to launch", 0.5, s.top * 0.45, 0.05);
  if (state === "won") lens.text("Level " + level + " cleared! Tap for the next", 0.5, s.top * 0.45, 0.055);
  if (state === "over") lens.text("Game over · " + score + " · tap to retry", 0.5, s.top * 0.45, 0.06);
}
