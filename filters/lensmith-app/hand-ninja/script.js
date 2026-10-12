// Hand Ninja — swipe your fingertip through the flying fruit. Miss three and it's over, and
// whatever you do, don't slice a bomb!
var FRUIT = ["assets/watermelon.png", "assets/orange.png", "assets/apple.png"];
var JUICE = ["💦", "🧡", "❤️"];
var items = [], trail = [], prevTip = null, score = 0, lives = 3, t = 0, spawn = 0;
var state = "ready", best = 0, endTime = -9, GRAVITY = 2.2;

function begin(lens) {
  state = "playing"; items = []; score = 0; lives = 3; t = 0; spawn = 0.6;
  lens.music("arcade", 0.3);
}

function end(lens) {
  state = "over"; endTime = lens.time; best = Math.max(best, score);
  lens.music(null); lens.sound("lose");
}

function tap(lens) {
  if (state !== "playing" && lens.time - endTime > 0.8) begin(lens);
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.05);
  var hand = lens.hands.length ? lens.hands[0] : null;
  var tip = hand ? hand.tip : null;

  // How fast the fingertip is moving: only a quick swipe slices.
  var speed = 0;
  if (tip && prevTip) speed = Math.sqrt((tip.x - prevTip.x) * (tip.x - prevTip.x) + (tip.y - prevTip.y) * (tip.y - prevTip.y)) / Math.max(dt, 0.001);
  prevTip = tip;
  if (tip) trail.push({ x: tip.x, y: tip.y, age: 0 });
  for (var i = trail.length - 1; i >= 0; i--) { trail[i].age += dt; if (trail[i].age > 0.22) trail.splice(i, 1); }

  // Waving a hand also starts the game.
  if (state !== "playing" && speed > 2.5 && lens.time - endTime > 1.2) begin(lens);

  if (state === "playing") {
    t += dt;
    spawn -= dt;
    if (spawn <= 0) {
      var bomb = t > 4 && Math.random() < 0.18;
      var x = lens.random(0.2, 0.8);
      var peak = s.top * lens.random(0.62, 0.85);
      var startY = s.top * 0.12;
      items.push({
        x: x, y: startY, vx: (0.5 - x) * lens.random(0.2, 0.6), vy: Math.sqrt(2 * GRAVITY * (peak - startY)),
        angle: 0, spin: lens.random(-200, 200), size: bomb ? 0.16 : 0.18,
        kind: bomb ? -1 : Math.floor(lens.random(0, FRUIT.length)),
      });
      lens.sound("whoosh", 0.4, lens.random(0.9, 1.2));
      spawn = Math.max(0.45, 1.2 - t * 0.02);
    }
    for (var j = items.length - 1; j >= 0; j--) {
      var it = items[j];
      it.vy -= GRAVITY * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.angle += it.spin * dt;
      var hit = tip && speed > 1.2 && Math.abs(tip.x - it.x) < it.size * 0.55 && Math.abs(tip.y - it.y) < it.size * 0.55;
      if (hit) {
        items.splice(j, 1);
        if (it.kind < 0) {
          lens.burst("💥", it.x, it.y, 1, "Explode", 0.3);
          lens.flash(1, 0.4, 0.2);
          lens.sound("boom");
          end(lens);
          return;
        }
        score++;
        lens.sound("whip", 0.9, lens.random(0.9, 1.2));
        lens.sound("splash", 0.5);
        lens.burst(JUICE[it.kind], it.x, it.y, 8, "Explode", 0.04);
      } else if (it.vy < 0 && it.y < s.top * 0.05) {
        items.splice(j, 1);
        if (it.kind >= 0) {
          lives--;
          lens.sound("buzz", 0.7);
          if (lives <= 0) { end(lens); return; }
        }
      }
    }
  }

  for (var k = 0; k < items.length; k++) {
    var o = items[k];
    lens.sprite(o.kind < 0 ? "assets/bomb.png" : o.kind === 0 ? "assets/watermelon.png" : o.kind === 1 ? "assets/orange.png" : "assets/apple.png",
      o.x, o.y, o.size, o.angle);
  }
  for (var n = 0; n < trail.length; n++) {
    lens.sprite("assets/blade.png", trail[n].x, trail[n].y, 0.06 * (1 - trail[n].age / 0.22) + 0.01, 0, 1 - trail[n].age / 0.22);
  }

  var hearts = "";
  for (var h = 0; h < 3; h++) hearts += h < lives ? "❤️" : "🖤";
  if (state === "playing") lens.text(score + "   " + hearts, 0.5, s.top - 0.2, 0.07);
  if (state === "ready") {
    lens.text("Hand Ninja", 0.5, s.top * 0.66, 0.11);
    lens.text(hand ? "Swipe through the fruit — wave to start!" : "Hold up a hand ✋ then wave to start", 0.5, s.top * 0.56, 0.05);
  }
  if (state === "over") {
    lens.text(score + " sliced!", 0.5, s.top * 0.66, 0.1);
    lens.text("Best " + best + " · wave or tap to play again", 0.5, s.top * 0.57, 0.05);
  }
}
