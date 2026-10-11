// Bling — twinkling sparkles all over the picture.
var sparkles = [];
var ART = ["✨", "✨", "✨", "💎", "⭐"];

function update(lens, dt) {
  var s = lens.screen;
  while (sparkles.length < 40) {
    sparkles.push({ x: lens.random(0, 1), y: lens.random(0, s.top), age: lens.random(-1.5, 0), life: lens.random(0.8, 1.6),
      size: lens.random(0.04, 0.11), art: ART[Math.floor(lens.random(0, ART.length))], spin: lens.random(-60, 60) });
  }
  for (var i = sparkles.length - 1; i >= 0; i--) {
    var p = sparkles[i];
    p.age += dt;
    if (p.age > p.life) { sparkles.splice(i, 1); continue; }
    if (p.age < 0) continue;
    var k = Math.sin(Math.PI * p.age / p.life);   // fade in and out
    lens.sprite(p.art, p.x, p.y, p.size * (0.5 + 0.5 * k), p.age * p.spin, k);
  }
}
