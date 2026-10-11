// Dizzy — cartoon stars spin around your head. Shake (tilt) your head to make them spin faster.
var spin = 1, lastTilt = 0;
var ART = ["⭐", "💫", "✨", "⭐", "💫", "🐤"];

function update(lens, dt) {
  var f = lens.face;
  if (!f) return;
  var change = Math.abs(f.tilt - lastTilt);
  lastTilt = f.tilt;
  spin = Math.min(8, Math.max(1, spin * Math.pow(0.6, dt) + change * 0.08));
  var cx = f.anchors.Forehead.x, cy = f.anchors.Forehead.y + f.width * 0.1;
  for (var i = 0; i < ART.length; i++) {
    var a = lens.time * spin + i * (Math.PI * 2 / ART.length);
    var x = cx + Math.cos(a) * f.width * 0.6;
    var y = cy + Math.sin(a) * f.width * 0.16;
    var front = Math.sin(a) < 0;
    lens.sprite(ART[i], x, y, f.width * (front ? 0.16 : 0.11), lens.time * 200, front ? 1 : 0.7);
  }
  if (spin > 5) lens.text("@#%!", f.x + f.width * 0.6, f.y + f.width * 0.7, f.width * 0.18, 0.9);
}
