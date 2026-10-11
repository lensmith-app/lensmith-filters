// Hand Heart — make a heart with both hands (thumbs together at the bottom, fingertips
// together at the top) and it fills with love. Peace sign ✌️ or 🤟 for a little extra.
var hold = 0, glow = 0, cooldown = 0, hearts = [], wasPeace = false, wasLove = false;

function dist(a, b) { return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)); }

function update(lens, dt) {
  var s = lens.screen;
  var hands = lens.hands;
  cooldown -= dt;

  var making = false, cx = 0.5, cy = s.top * 0.55, size = 0.3;
  if (hands.length === 2) {
    var a = hands[0], b = hands[1];
    var reach = (a.size + b.size) / 2;
    making = dist(a.tip, b.tip) < reach * 0.45 && dist(a.thumb, b.thumb) < reach * 0.5;
    cx = (a.tip.x + b.tip.x + a.thumb.x + b.thumb.x) / 4;
    cy = (a.tip.y + b.tip.y + a.thumb.y + b.thumb.y) / 4;
    size = Math.max(0.15, Math.abs(a.x - b.x) * 0.9);
  }
  hold = making ? hold + dt : 0;
  glow = Math.max(0, Math.min(1, glow + (hold > 0.15 ? dt * 3 : -dt * 2)));

  if (hold > 0.15 && cooldown <= 0) {
    cooldown = 1.4;
    lens.sound("sparkle");
    lens.burst("💖", cx, cy, 14, "Explode", 0.05);
    for (var n = 0; n < 6; n++) hearts.push({ x: cx + lens.random(-0.1, 0.1), y: cy, v: lens.random(0.2, 0.4), w: lens.random(0.04, 0.08), sway: lens.random(0, 6), age: 0 });
  }
  if (glow > 0) lens.sprite("assets/heart.png", cx, cy, size * (0.9 + 0.08 * Math.sin(lens.time * 8)), 0, glow);

  for (var i = 0; i < hands.length; i++) {
    var h = hands[i];
    var peace = h.gesture === "peace", love = h.gesture === "loveYou";
    if (peace && !wasPeace) { lens.burst("✌️", h.x, h.y + h.size * 0.6, 1, "Fountain", 0.12); lens.burst("✨", h.x, h.y + h.size * 0.6, 8, "Explode", 0.03); lens.sound("pop"); }
    if (love && !wasLove) { lens.burst("🤟", h.x, h.y + h.size * 0.6, 1, "Fountain", 0.12); lens.burst("💜", h.x, h.y, 8, "Fountain", 0.05); lens.sound("powerup", 0.6); }
    if (i === 0) { wasPeace = peace; wasLove = love; }
  }

  for (var j = hearts.length - 1; j >= 0; j--) {
    var q = hearts[j];
    q.age += dt; q.y += q.v * dt;
    if (q.age > 3) { hearts.splice(j, 1); continue; }
    lens.sprite("assets/heart.png", q.x + Math.sin(q.age * 3 + q.sway) * 0.03, q.y, q.w, 0, 1 - q.age / 3);
  }

  if (!hands.length) lens.text("Make a heart with your hands 🫶", 0.5, s.top - 0.22, 0.055);
}
