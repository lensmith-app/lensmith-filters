// Dino Dash — open your mouth (or tap) to jump over the cacti. How far can you run?
var dinoY = 0, vy = 0, cacti = [], clouds = [], groundX = 0, dist = 0, speed = 0.55, state = "ready", best = 0, endTime = 0, wasOpen = false, nextCactus = 1;

function jump() {
  if (dinoY <= 0.0001) vy = 1.35;
}

function start(lens) {
  for (var i = 0; i < 3; i++) clouds.push({ x: lens.random(0, 1), y: lens.random(0.55, 0.8), s: lens.random(0.12, 0.2) });
}

function tap(lens) {
  if (state === "ready" || (state === "over" && lens.time - endTime > 0.8)) {
    state = "playing"; cacti = []; dist = 0; speed = 0.55; nextCactus = 1; dinoY = 0; vy = 0; return;
  }
  if (state === "playing") jump();
}

function update(lens, dt) {
  var s = lens.screen;
  var ground = s.top * 0.3, dx = 0.2, dw = 0.17;
  dt = Math.min(dt, 0.05);
  var open = lens.face ? lens.face.mouthOpen > 0.35 : false;
  if (open && !wasOpen && state === "playing") jump();
  wasOpen = open;

  if (state === "playing") {
    dist += speed * dt * 10;
    speed = Math.min(1.2, 0.55 + dist * 0.0015);
    vy -= 3.6 * dt;
    dinoY = Math.max(0, dinoY + vy * dt);
    if (dinoY === 0) vy = 0;
    groundX = (groundX + speed * dt) % 0.5;
    nextCactus -= speed * dt;
    if (nextCactus <= 0) {
      cacti.push({ x: 1.15, h: lens.random(0.08, 0.12) });
      nextCactus = lens.random(0.55, 1.1);
    }
    for (var i = cacti.length - 1; i >= 0; i--) {
      var c = cacti[i];
      c.x -= speed * dt;
      if (c.x < -0.1) { cacti.splice(i, 1); continue; }
      if (Math.abs(c.x - dx) < 0.06 && dinoY < c.h * 0.85) {
        state = "over"; endTime = lens.time; best = Math.max(best, Math.floor(dist));
        lens.burst("💫", dx, ground + 0.1, 6, "Explode", 0.05); lens.flash(1, 0.4, 0.4);
      }
    }
  }
  for (var k = 0; k < clouds.length; k++) {
    var cl = clouds[k];
    if (state === "playing") cl.x -= speed * dt * 0.2;
    if (cl.x < -0.2) { cl.x = 1.2; cl.y = lens.random(0.55, 0.8); }
    lens.sprite("assets/cloud.png", cl.x, s.top * cl.y, cl.s, 0, 0.9);
  }
  for (var g = -1; g < 3; g++) lens.sprite("assets/ground.png", g * 0.5 - groundX + 0.25, ground - 0.035, 0.5);
  for (var j = 0; j < cacti.length; j++) lens.sprite("assets/cactus.png", cacti[j].x, ground + cacti[j].h * 0.6 - 0.01, cacti[j].h * 0.75);
  var bob = state === "playing" && dinoY === 0 ? Math.abs(Math.sin(lens.time * 14)) * 0.006 : 0;
  lens.sprite("assets/dino.png", dx, ground + dw * 0.45 + dinoY + bob, dw, state === "over" ? -20 : 0);

  lens.text(Math.floor(dist) + " m", 0.5, s.top - 0.18, 0.09);
  if (state === "ready") lens.text("Tap to run · open your mouth to jump!", 0.5, s.top * 0.55, 0.05);
  if (state === "over") {
    lens.text("OUCH! " + Math.floor(dist) + " m", 0.5, s.top * 0.6, 0.09);
    lens.text("Best " + best + " m · tap to run again", 0.5, s.top * 0.52, 0.05);
  }
}
