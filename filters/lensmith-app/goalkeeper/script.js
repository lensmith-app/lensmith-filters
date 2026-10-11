// Goalkeeper — penalty shots fly at you! Move your head so your gloves are where the ball lands.
// Ten shots: how many can you save?
var SHOTS = 10;
var ball = null, saved = 0, taken = 0, state = "ready", best = 0, next = 0, result = "", resultTime = -9, gloveX = 0.5, gloveY = 1;

function shoot(lens) {
  var s = lens.screen;
  var speed = Math.max(0.75, 1.3 - taken * 0.05);    // later shots are faster
  lens.sound("kick");
  ball = { t: 0, dur: speed, tx: lens.random(0.2, 0.8), ty: lens.random(s.top * 0.35, s.top * 0.7), curve: lens.random(-0.15, 0.15) };
}

function tap(lens) {
  if (state === "playing") return;
  saved = 0; taken = 0; state = "playing"; next = 1; ball = null;
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  if (f) {
    // Gloves follow your face, exaggerated so small moves cover the whole goal.
    gloveX += (0.5 + (f.x - 0.5) * 2 - gloveX) * Math.min(1, dt * 12);
    gloveY += (s.top * 0.5 + (f.y - s.top * 0.5) * 1.6 - gloveY) * Math.min(1, dt * 12);
  }
  lens.sprite("assets/goal.png", 0.5, s.top * 0.55, 1.0, 0, 0.45);   // see-through so you stay visible
  if (state === "playing") {
    if (!ball) {
      next -= dt;
      if (next <= 0) shoot(lens);
    } else {
      ball.t += dt / ball.dur;
      var k = Math.min(1, ball.t);
      // Flies from far away (small, at the penalty spot) toward the screen, curving a little.
      var x = 0.5 + (ball.tx - 0.5) * k + Math.sin(k * Math.PI) * ball.curve;
      var y = s.top * 0.45 + (ball.ty - s.top * 0.45) * k;
      var size = 0.04 + k * k * 0.18;
      lens.sprite("assets/soccer.png", x, y, size, k * 720);
      if (k >= 1) {
        taken++;
        if (Math.abs(gloveX - ball.tx) < 0.16 && Math.abs(gloveY - ball.ty) < 0.18) {
          saved++; result = "SAVED! 🧤"; lens.sound("whip"); lens.burst("✨", ball.tx, ball.ty, 12, "Explode", 0.05);
        } else { result = "GOAL…"; lens.sound("buzz", 0.8); lens.flash(1, 0.5, 0.4); }
        resultTime = lens.time; ball = null; next = 0.9;
        if (taken >= SHOTS) { state = "over"; lens.sound(saved >= SHOTS / 2 ? "win" : "lose"); best = Math.max(best, saved); }
      }
    }
  }
  lens.sprite("assets/glove.png", gloveX - 0.08, gloveY, 0.13, 15);
  lens.sprite("assets/glove.png", gloveX + 0.08, gloveY, 0.13, -15);
  lens.text(saved + " saved · " + taken + "/" + SHOTS, 0.5, s.top - 0.18, 0.065);
  if (lens.time - resultTime < 0.8) lens.text(result, 0.5, s.top * 0.3, 0.08);
  if (state === "ready") lens.text("Tap to start · move your head to save!", 0.5, s.top * 0.3, 0.05);
  if (state === "over") {
    lens.text(saved + " of " + SHOTS + " saved!", 0.5, s.top * 0.32, 0.08);
    lens.text("Best " + best + " · tap to play again", 0.5, s.top * 0.25, 0.045);
  }
}
