// 6-7 Hands — hold both hands up, palms out, and pump them up and down in turn like the meme.
// The clock starts on your first pump. How many in 10 seconds? Can you hit 67?
var LENGTH = 10;
var RANKS = [[20, "Warming up 🐢"], [40, "Getting there ⚡"], [67, "So close to 67! 😤"], [90, "67 CLUB 🔥"], [999, "Pump demon 👹"]];
var state = "ready", t = 0, count = 0, high = "", best = 0, endTime = -9, hit67 = false;

function tap(lens) {
  if (state === "over" && lens.time - endTime > 1) { state = "ready"; count = 0; high = ""; }
}

function update(lens, dt) {
  var s = lens.screen;
  var hands = lens.hands;

  if (hands.length === 2 && state !== "over") {
    // Left and right as you see them on screen.
    var a = hands[0].x < hands[1].x ? hands[0] : hands[1];
    var b = a === hands[0] ? hands[1] : hands[0];
    var gap = (a.size + b.size) * 0.12;
    var now = a.y - b.y > gap ? "a" : b.y - a.y > gap ? "b" : high;
    if (now !== high && now !== "") {
      if (high !== "") {
        if (state === "ready") { state = "playing"; t = 0; count = 0; hit67 = false; lens.music("beat", 0.35); }
        count++;
        lens.sound("tick", 0.6, Math.min(2, 0.8 + count * 0.012));
        if (count === 67 && !hit67) { hit67 = true; lens.sound("powerup"); lens.flash(1, 0.85, 0.2); lens.popup("67!!"); }
      }
      high = now;
    }
    lens.sprite("assets/badge.png", a.x, a.y + a.size * 0.9, 0.16);
    lens.text("6", a.x, a.y + a.size * 0.9, 0.08);
    lens.sprite("assets/badge.png", b.x, b.y + b.size * 0.9, 0.16);
    lens.text("7", b.x, b.y + b.size * 0.9, 0.08);
  }

  if (state === "playing") {
    t += dt;
    if (t >= LENGTH) {
      state = "over"; endTime = lens.time; best = Math.max(best, count);
      lens.music(null); lens.sound(count >= 67 ? "win" : "ding");
    }
    lens.text(String(count), 0.5, s.top - 0.3, 0.16);
    lens.text(Math.max(0, LENGTH - t).toFixed(1) + "s", 0.5, s.top - 0.42, 0.06);
  }
  if (state === "ready") {
    lens.text("6-7 Hands", 0.5, s.top - 0.22, 0.1);
    lens.text(hands.length === 2 ? "Pump them up and down — go!" : "Hold up both hands ✋✋", 0.5, s.top - 0.32, 0.055);
  }
  if (state === "over") {
    var rank = "";
    for (var r = 0; r < RANKS.length; r++) if (count < RANKS[r][0]) { rank = RANKS[r][1]; break; }
    lens.text(count + " pumps", 0.5, s.top - 0.26, 0.1);
    lens.text(rank, 0.5, s.top - 0.36, 0.06);
    lens.text("Best " + best + " · tap to go again", 0.5, s.top - 0.44, 0.045);
  }
}
