// Haunted — an old tape from a haunted house. Ghosts drift past, and every so often one
// swoops right at you. Boo!
var ghosts = [], next = 1.5, swoop = null, music = false;

function spawn(lens) {
  var s = lens.screen;
  var fromLeft = Math.random() < 0.5;
  ghosts.push({
    x: fromLeft ? -0.15 : 1.15, y: lens.random(s.top * 0.35, s.top * 0.9),
    vx: (fromLeft ? 1 : -1) * lens.random(0.08, 0.16), size: lens.random(0.14, 0.24),
    wob: lens.random(0, 6), alpha: lens.random(0.35, 0.6),
  });
}

function update(lens, dt) {
  var s = lens.screen, f = lens.face;
  dt = Math.min(dt, 0.05);
  if (!music) { lens.music("assets/spooky-loop.ogg", 0.3); music = true; }

  lens.sprite("assets/moon.png", 0.82, s.top - 0.22, 0.22, 0, 0.85);
  lens.sprite("assets/fog.png", 0.5 + Math.sin(lens.time * 0.2) * 0.05, s.top * 0.22, 1.4, 0, 0.8);

  next -= dt;
  if (next <= 0) { spawn(lens); next = lens.random(1.5, 3.5); }
  for (var i = ghosts.length - 1; i >= 0; i--) {
    var g = ghosts[i];
    g.x += g.vx * dt;
    if (g.x < -0.3 || g.x > 1.3) { ghosts.splice(i, 1); continue; }
    lens.sprite("assets/ghost.png", g.x, g.y + Math.sin(lens.time * 2 + g.wob) * 0.03, g.size, Math.sin(lens.time + g.wob) * 8, g.alpha);
  }

  // Now and then, a ghost swoops at the face.
  if (!swoop && Math.random() < dt / 9) {
    swoop = { t: 0 };
    lens.sound("assets/boo.ogg", 0.9, lens.random(0.9, 1.1));
  }
  if (swoop) {
    swoop.t += dt;
    var k = swoop.t / 1.6;
    if (k >= 1) swoop = null;
    else {
      var tx = f ? f.x : 0.5, ty = f ? f.y : s.top * 0.5;
      var grow = Math.sin(k * Math.PI);
      lens.sprite("assets/ghost.png", tx + (1 - k) * 0.4 - 0.2, ty + 0.05, 0.15 + grow * 0.55, (0.5 - k) * 30, 0.85 * grow);
    }
  }
}
