// Cup Pong — first tap locks your aim (the ball slides left and right), second tap sets the power
// (watch the meter). Sink all six cups in as few throws as you can!
var cups = [], phase = "aim", aimX = 0.5, power = 0, ball = null, throws = 0, state = "ready", best = 0, result = "", resultTime = -9;

function apexY(lens) { return lens.screen.top - 0.62; }

function rack(lens) {
  var s = lens.screen;
  cups = [];
  // The single cup is nearest you (lowest on screen); the row of three is at the back.
  var rows = [[0.5], [0.42, 0.58], [0.34, 0.5, 0.66]];
  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < rows[r].length; c++) cups.push({ x: rows[r][c], y: apexY(lens) + r * 0.07, depth: r, in: false });
  }
}

function tap(lens) {
  if (state !== "playing") { rack(lens); throws = 0; state = "playing"; phase = "aim"; return; }
  if (phase === "aim") { phase = "power"; lens.sound("click"); return; }
  if (phase === "power") {
    // Power 0..1 decides how far up the table it lands: low power = the nearest cup.
    var s = lens.screen;
    var landY = apexY(lens) - 0.03 + power * 0.2;
    ball = { t: 0, x0: aimX, y0: s.top * 0.3, x1: aimX, y1: landY };
    phase = "flying"; throws++; lens.sound("whoosh", 0.7);
  }
}

function update(lens, dt) {
  var s = lens.screen;
  if (state === "ready" && cups.length === 0) rack(lens);
  if (state === "playing") {
    if (phase === "aim") aimX = 0.5 + Math.sin(lens.time * 2.4) * 0.22;
    if (phase === "power") power = 0.5 + Math.sin(lens.time * 3.2) * 0.5;
  }
  // Back row (depth 2) first so nearer cups draw on top.
  for (var d = 2; d >= 0; d--) {
    for (var i = 0; i < cups.length; i++) {
      var c = cups[i];
      if (c.depth === d && !c.in) lens.sprite("assets/cup.png", c.x, c.y, 0.11 - d * 0.01);
    }
  }
  if (phase === "flying" && ball) {
    ball.t += dt / 0.8;
    var k = Math.min(1, ball.t);
    var x = ball.x0 + (ball.x1 - ball.x0) * k;
    var y = ball.y0 + (ball.y1 - ball.y0) * k + Math.sin(k * Math.PI) * 0.35;
    lens.sprite("assets/ball.png", x, y, 0.055 - k * 0.02, k * 500);
    if (k >= 1) {
      var sunk = null;
      for (var j = 0; j < cups.length; j++) {
        var cp = cups[j];
        if (!cp.in && Math.abs(cp.x - ball.x1) < 0.045 && Math.abs(cp.y + 0.02 - ball.y1) < 0.04) { sunk = cp; break; }
      }
      if (sunk) { sunk.in = true; lens.sound("splash"); result = "SPLASH! 💦"; lens.burst("💦", sunk.x, sunk.y + 0.04, 10, "Fountain", 0.04); }
      else result = "Miss";
      resultTime = lens.time; ball = null; phase = "aim";
      var left = 0;
      for (var m = 0; m < cups.length; m++) if (!cups[m].in) left++;
      if (left === 0) { state = "won"; lens.sound("win"); best = best ? Math.min(best, throws) : throws; lens.flash(1, 0.9, 0.5); }
    }
  }
  if (state === "playing" && phase !== "flying") {
    lens.sprite("assets/ball.png", aimX, s.top * 0.3, 0.055);
    lens.sprite("assets/meter.png", 0.9, s.top * 0.42, 0.08);
    if (phase === "power") lens.sprite("assets/ball.png", 0.9, s.top * 0.42 - 0.2 + power * 0.4, 0.04);
  }
  lens.text("Throws: " + throws, 0.5, s.top - 0.18, 0.065);
  if (lens.time - resultTime < 0.8) lens.text(result, 0.5, s.top * 0.5, 0.07);
  if (state === "ready") lens.text("Tap to aim, tap again for power", 0.5, s.top * 0.5, 0.05);
  if (state === "playing" && phase === "aim") lens.text("Tap to lock your aim", 0.5, s.top * 0.22, 0.045, 0.85);
  if (state === "playing" && phase === "power") lens.text("Tap to throw!", 0.5, s.top * 0.22, 0.045, 0.85);
  if (state === "won") {
    lens.text("All cups in " + throws + " throws!", 0.5, s.top * 0.5, 0.075);
    lens.text("Best " + best + " · tap to rack again", 0.5, s.top * 0.43, 0.045);
  }
}
