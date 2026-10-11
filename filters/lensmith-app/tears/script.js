// Tears — big cartoon tears roll down from your eyes. Open your mouth to really cry.
var drops = [];
var timer = 0;

function update(lens, dt) {
  var f = lens.face;
  if (f) {
    var crying = f.mouthOpen > 0.3;
    timer -= dt;
    if (timer <= 0) {
      timer = crying ? 0.12 : 0.45;
      var eyes = [f.anchors.LeftEye, f.anchors.RightEye];
      for (var e = 0; e < 2; e++) {
        drops.push({ x: eyes[e].x + lens.random(-0.01, 0.01), y: eyes[e].y - f.width * 0.08, vy: 0, vx: lens.random(-0.02, 0.02),
          size: f.width * lens.random(0.07, crying ? 0.13 : 0.1) });
      }
    }
    if (crying) lens.sprite("😭", f.x + f.width * 0.6, f.y + f.width * 0.55, f.width * 0.22, 0, 0.9);
  }
  for (var i = drops.length - 1; i >= 0; i--) {
    var d = drops[i];
    d.vy -= 0.9 * dt;
    d.y += d.vy * dt;
    d.x += d.vx * dt;
    if (d.y < -0.1) { drops.splice(i, 1); continue; }
    lens.sprite("💧", d.x, d.y, d.size, 0, 0.9);
  }
}
