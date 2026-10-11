// 67 Speed — tap as fast as you can for 10 seconds. Can you hit 67?
var LENGTH = 10;
var taps = [], count = 0, t = 0, state = "ready", best = 0, endTime = 0, needle = -90, hit67 = false;
var RANKS = [[30, "Warming up 🐢"], [50, "Quick fingers ⚡"], [67, "So close to 67! 😤"], [80, "67 CLUB 🔥"], [999, "Speed demon 👹"]];

function tap(lens) {
  if (state === "playing") {
    count++; taps.push(lens.time);
    lens.sound("tick", 0.6, Math.min(2, 0.8 + count * 0.012));
    if (count === 67 && !hit67) { hit67 = true; lens.sound("powerup"); lens.flash(1, 0.85, 0.2); lens.burst("🔥", 0.5, lens.screen.top * 0.6, 20, "Explode", 0.07); lens.popup("67!!"); }
    return;
  }
  if (state === "over" && lens.time - endTime < 1.2) return;
  state = "playing"; count = 0; t = 0; taps = []; hit67 = false; lens.music("beat", 0.35);
}

function update(lens, dt) {
  var s = lens.screen;
  var gy = s.top * 0.62;
  if (state === "playing") {
    t += dt;
    if (t >= LENGTH) { state = "over"; lens.music(null); lens.sound(count >= 67 ? "win" : "ding"); endTime = lens.time; best = Math.max(best, count); }
  }
  // Taps per second over the last second drives the needle (0..12 taps/s).
  while (taps.length && lens.time - taps[0] > 1) taps.shift();
  var rate = state === "playing" ? taps.length : 0;
  var target = -90 + Math.min(1, rate / 12) * 180;
  needle += (target - needle) * Math.min(1, dt * 8);
  lens.sprite("assets/gauge.png", 0.5, gy, 0.7);
  // The needle pivots at the dial's hub (0.15 below the gauge's centre) and is 0.135 long.
  var hubY = gy - 0.149, r = 0.055;
  lens.sprite("assets/needle.png", 0.5 + Math.sin(needle * Math.PI / 180) * r, hubY + Math.cos(needle * Math.PI / 180) * r, 0.03, -needle);
  // The big glowing counter.
  var glow = state === "playing" ? 1 + Math.sin(lens.time * 20) * 0.03 : 1;
  lens.text(String(count), 0.5, Math.min(gy + 0.25, s.top - 0.36), 0.22 * glow);
  lens.text(rate + " taps/s", 0.5, gy - 0.18, 0.05, 0.85);
  if (state === "ready") lens.text("Tap as fast as you can! Hit 67?", 0.5, s.top - 0.2, 0.06);
  if (state === "playing") lens.text((LENGTH - t).toFixed(1) + "s", 0.5, s.top - 0.2, 0.07);
  if (state === "over") {
    var rank = "";
    for (var i = 0; i < RANKS.length; i++) if (count < RANKS[i][0]) { rank = RANKS[i][1]; break; }
    lens.text(rank, 0.5, s.top - 0.2, 0.07);
    lens.text("Best " + best + " · tap to go again", 0.5, gy - 0.26, 0.045);
  }
}
