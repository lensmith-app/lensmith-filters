// Bee Buzz — a little swarm of bees circles your head. Open your mouth and they panic.
var BEES = 5;

function update(lens, dt) {
  var f = lens.face;
  if (!f) return;
  var panic = f.mouthOpen > 0.4;
  var speed = panic ? 5 : 1.6;
  var cx = f.anchors.Forehead.x, cy = f.anchors.Forehead.y - f.width * 0.05;
  for (var i = 0; i < BEES; i++) {
    var a = lens.time * speed + i * (Math.PI * 2 / BEES);
    var rx = f.width * (panic ? 0.95 : 0.75), ry = f.width * (panic ? 0.5 : 0.28);
    var x = cx + Math.cos(a) * rx;
    var y = cy + Math.sin(a) * ry + Math.sin(lens.time * 9 + i) * 0.01;
    var behind = Math.sin(a) > 0.6;   // bees at the back look a bit smaller
    lens.sprite("🐝", x, y, f.width * (behind ? 0.13 : 0.17), Math.cos(a) > 0 ? -15 : 15, behind ? 0.75 : 1);
  }
  if (panic && Math.random() < 0.15) lens.burst("💦", f.x + lens.random(-0.1, 0.1), f.y + f.width * 0.5, 2, "Explode", 0.04);
}
