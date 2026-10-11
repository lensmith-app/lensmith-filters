// Hoop Shot — the arrow swings; tap to shoot when it's lined up. Ten shots, how many swish?
var SHOTS = 10;
var G = 3.0;
var hoopX = 0.5, hoopDir = 1, aim = 0, ball = null, made = 0, taken = 0, state = "ready", best = 0, streak = 0, result = "", resultTime = 0;

function tap(lens) {
  var s = lens.screen;
  if (state === "ready" || state === "over") { made = 0; taken = 0; streak = 0; state = "aiming"; return; }
  if (state !== "aiming") return;
  // The arc peaks 0.25 above the rim on any screen; the aim decides where it comes down
  // (straight up = the middle, the ends of the swing = 0.3 to either side).
  var rise = (s.top - 0.52) - s.top * 0.3 + 0.25;
  var vy = Math.sqrt(2 * G * rise);
  var flight = vy / G + Math.sqrt(2 * 0.25 / G);
  ball = { x: 0.5, y: s.top * 0.3, vx: (-aim / 28) * 0.3 / flight, vy: vy, scored: false };
  state = "flying";
  lens.sound("whoosh", 0.7);
}

function update(lens, dt) {
  var s = lens.screen;
  var rimY = s.top - 0.52, rimW = 0.17;
  dt = Math.min(dt, 0.04);
  // After a few baskets the hoop starts to move.
  if (made >= 3) {
    hoopX += hoopDir * dt * (0.12 + made * 0.015);
    if (hoopX > 0.75) hoopDir = -1;
    if (hoopX < 0.25) hoopDir = 1;
  }
  if (state === "aiming") aim = Math.sin(lens.time * 2.2) * 28;
  lens.sprite("assets/hoop.png", hoopX, rimY + 0.09, 0.42);

  if (state === "flying") {
    ball.vy -= G * dt;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    // Score when the ball drops down through the rim.
    if (ball.vy < 0 && !ball.scored && Math.abs(ball.y - (rimY - 0.015)) < 0.03) {
      if (Math.abs(ball.x - hoopX) < rimW / 2 - 0.02) {
        ball.scored = true; made++; streak++; lens.sound(streak >= 3 ? "powerup" : "swish");
        lens.burst("✨", hoopX, rimY, 12, "Explode", 0.05);
        result = streak >= 3 ? "ON FIRE! 🔥" : "Swish!"; resultTime = lens.time;
      } else if (Math.abs(ball.x - hoopX) < rimW / 2 + 0.03) {
        ball.vx = -ball.vx * 0.6; ball.vy = Math.abs(ball.vy) * 0.4;   // clanked off the rim
        lens.sound("bounce", 0.8);
      }
    }
    if (ball.y < s.top * 0.15 || ball.x < -0.2 || ball.x > 1.2) {
      taken++;
      if (!ball.scored) { streak = 0; result = "Miss"; resultTime = lens.time; }
      ball = null;
      state = taken >= SHOTS ? "over" : "aiming";
      if (state === "over") { best = Math.max(best, made); lens.sound("win"); lens.flash(1, 0.9, 0.5); }
    }
  }
  if (ball) lens.sprite("assets/basketball.png", ball.x, ball.y, 0.1, lens.time * 300);
  if (state === "aiming") {
    lens.sprite("assets/basketball.png", 0.5, s.top * 0.3, 0.1);
    for (var d = 1; d <= 5; d++) {
      var a = (90 + aim) * Math.PI / 180;
      lens.sprite("assets/basketball.png", 0.5 + Math.cos(a) * d * 0.06, s.top * 0.3 + Math.sin(a) * d * 0.06, 0.025, 0, 1 - d * 0.15);
    }
  }
  lens.text(made + " / " + taken, 0.5, s.top - 0.18, 0.09);
  if (lens.time - resultTime < 1) lens.text(result, 0.5, s.top * 0.55, 0.07);
  if (state === "ready") lens.text("Tap to shoot when the arrow lines up", 0.5, s.top * 0.45, 0.05);
  if (state === "over") {
    lens.text(made + " of " + SHOTS + " baskets!", 0.5, s.top * 0.5, 0.08);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.43, 0.045);
  }
}
