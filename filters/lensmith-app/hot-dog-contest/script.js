// Hot Dog Contest — open and close your mouth to chomp. How many hot dogs can you eat in 30 seconds?
var LENGTH = 30, BITES = 3;
var state = "ready", t = 0, eaten = 0, bites = 0, wasOpen = false, best = 0, endTime = 0, wiggle = 0;

function tap(lens) {
  if (state === "playing" || (state === "over" && lens.time - endTime < 1)) return;
  state = "playing"; t = 0; eaten = 0; bites = 0; lens.music("beat", 0.35);
}

function update(lens, dt) {
  var s = lens.screen;
  var f = lens.face;
  if (state === "playing") {
    t += dt;
    if (f) {
      var open = f.mouthOpen > 0.35;
      if (wasOpen && !open) {                 // a chomp = mouth closing
        bites++;
        lens.sound("chomp", 0.9, lens.random(0.85, 1.15));
        wiggle = 0.25;
        lens.burst("✨", f.anchors.Mouth.x, f.anchors.Mouth.y, 3, "Explode", 0.03);
        if (bites >= BITES) { bites = 0; eaten++; lens.sound("coin"); lens.burst("✨", f.anchors.Mouth.x, f.anchors.Mouth.y, 8, "Explode", 0.04); }
      }
      wasOpen = open;
    }
    if (t >= LENGTH) { state = "over"; lens.music(null); lens.sound("win"); endTime = lens.time; best = Math.max(best, eaten); lens.flash(1, 0.9, 0.4); }
  }
  wiggle = Math.max(0, wiggle - dt);

  // The plate of hot dogs still waiting, at the bottom of the play area.
  var py = s.top * 0.3;
  lens.sprite("assets/plate.png", 0.5, py, 0.75);
  for (var i = 0; i < 4; i++) lens.sprite("assets/hotdog.png", 0.32 + i * 0.12, py + 0.03 + (i % 2) * 0.02, 0.22, -8 + i * 6);

  // The hot dog you're eating, held at your mouth and getting shorter with every bite.
  if (state === "playing" && f) {
    var left = (BITES - bites) / BITES;
    var w = f.width * 0.95 * (0.35 + 0.65 * left);
    var shake = Math.sin(lens.time * 60) * wiggle * 0.03;
    lens.sprite("assets/hotdog.png", f.anchors.Mouth.x + f.width * 0.2 * (1 - left) + shake, f.anchors.Mouth.y - f.width * 0.05, w);
  }

  lens.text("🌭 " + eaten, 0.5, s.top - 0.18, 0.1);
  if (state === "ready") {
    lens.text("Hot Dog Contest", 0.5, s.top - 0.3, 0.075);
    lens.text("Tap to start · chomp chomp chomp!", 0.5, s.top - 0.38, 0.045);
  }
  if (state === "playing") {
    lens.text(Math.ceil(LENGTH - t) + "s", 0.5, s.top - 0.29, 0.06, 0.85);
    if (!f) lens.text("Show your face!", 0.5, s.top * 0.55, 0.06);
  }
  if (state === "over") {
    lens.sprite("assets/trophy.png", 0.5, s.top * 0.62, 0.3);
    lens.text(eaten + " hot dog" + (eaten === 1 ? "" : "s") + "!", 0.5, s.top * 0.48, 0.09);
    lens.text("Best " + best + " · tap to eat again", 0.5, s.top * 0.41, 0.045);
  }
}
