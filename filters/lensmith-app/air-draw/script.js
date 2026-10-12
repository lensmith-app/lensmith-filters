// Air Draw — point your finger ☝️ (or pinch) and paint glowing lines in the air.
// Peace sign ✌️ or a tap changes colour; hold your hand open ✋ to wipe the canvas.
var COLORS = ["assets/dot-red.png", "assets/dot-orange.png", "assets/dot-yellow.png", "assets/dot-green.png", "assets/dot-blue.png", "assets/dot-purple.png"];
var dots = [], color = 4, last = null, wasPeace = false, wipe = 0, MAX_DOTS = 700, STEP = 0.016;

function nextColor(lens) {
  color = (color + 1) % COLORS.length;
  lens.sound("pop", 0.7, 1 + color * 0.08);
}

function tap(lens) { nextColor(lens); }

function update(lens, dt) {
  var s = lens.screen;
  var hand = lens.hands.length ? lens.hands[0] : null;
  var drawing = hand && (hand.gesture === "point" || hand.pinch);

  if (drawing) {
    var p = hand.tip;
    if (last) {
      // Fill the gap since last frame so fast strokes stay smooth.
      var dx = p.x - last.x, dy = p.y - last.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.25) {
        for (var k = STEP; k < d; k += STEP) dots.push({ x: last.x + dx * k / d, y: last.y + dy * k / d, c: color });
      }
    }
    if (!last || dots.length === 0 || Math.abs(p.x - last.x) + Math.abs(p.y - last.y) >= STEP * 0.5) {
      dots.push({ x: p.x, y: p.y, c: color });
      last = { x: p.x, y: p.y };
    }
    if (dots.length > MAX_DOTS) dots.splice(0, dots.length - MAX_DOTS);
  } else last = null;

  var peace = hand && hand.gesture === "peace";
  if (peace && !wasPeace) nextColor(lens);
  wasPeace = peace;

  if (hand && hand.gesture === "open" && dots.length) {
    wipe += dt;
    if (wipe > 0.8) {
      dots = []; wipe = 0;
      lens.sound("whoosh");
      lens.burst("✨", hand.x, hand.y, 10, "Explode", 0.04);
    }
  } else wipe = 0;

  for (var i = 0; i < dots.length; i++) lens.sprite(COLORS[dots[i].c], dots[i].x, dots[i].y, 0.035);
  if (hand) {
    lens.sprite(drawing ? COLORS[color] : "assets/cursor.png", hand.tip.x, hand.tip.y, drawing ? 0.05 : 0.06);
    if (wipe > 0) lens.text("Wiping… " + Math.ceil((0.8 - wipe) * 10), hand.x, hand.y + hand.size * 0.8, 0.045);
  }
  if (!dots.length) {
    lens.text(hand ? "☝️ point to draw" : "Hold up your hand ✋", 0.5, s.top - 0.22, 0.06);
    lens.text("✌️ new colour · ✋ hold to wipe", 0.5, s.top - 0.3, 0.045);
  }
}
