// Stack Tower — tap to drop the sliding block. Whatever hangs over the edge falls off.
// Line it up perfectly to keep your tower wide!
var TILE = 0.06;          // blocks are rows of square tiles
var TILES = ["assets/tile0.png", "assets/tile1.png", "assets/tile2.png", "assets/tile3.png"];
var START = 7;            // tiles in the first block
var rows = [], moving = null, dir = 1, speed = 0.45, state = "ready", best = 0, scroll = 0, falling = [], endTime = 0;

function reset() {
  rows = [{ x: 0.5 - START * TILE / 2, n: START, color: 0 }];
  newBlock();
  scroll = 0; falling = []; speed = 0.45;
}

function newBlock() {
  var top = rows[rows.length - 1];
  moving = { x: Math.random() < 0.5 ? 0 : 1 - top.n * TILE, n: top.n, color: rows.length % 4 };
  dir = moving.x < 0.5 ? 1 : -1;
}

function tap(lens) {
  if (state === "ready" || (state === "over" && lens.time - endTime > 0.8)) { reset(); state = "playing"; lens.music("chill", 0.35); return; }
  if (state !== "playing") return;
  var top = rows[rows.length - 1];
  // Snap to the tile grid of the block below.
  var offset = Math.round((moving.x - top.x) / TILE);
  var n = moving.n - Math.abs(offset);
  if (n <= 0) {
    falling.push({ x: moving.x, y: rows.length, n: moving.n, color: moving.color, vy: 0 });
    lens.music(null); lens.sound("lose");
    state = "over"; endTime = lens.time; best = Math.max(best, rows.length - 1); lens.flash(1, 0.4, 0.4);
    return;
  }
  var x = offset > 0 ? top.x + offset * TILE : top.x;
  if (offset !== 0) {
    lens.sound("kick", 0.8);
    // The overhanging part tumbles away.
    var cutX = offset > 0 ? x + n * TILE : top.x + offset * TILE;
    falling.push({ x: cutX, y: rows.length, n: Math.abs(offset), color: moving.color, vy: 0 });
  } else {
    lens.burst("✨", x + n * TILE / 2, 0, 10, "Explode", 0.04);
    lens.popup("Perfect!");
    lens.sound("sparkle");
  }
  rows.push({ x: x, n: n, color: moving.color });
  speed = Math.min(1.1, speed + 0.03);
  newBlock();
}

function rowY(lens, i) {
  return lens.screen.top * 0.28 + i * TILE - scroll;
}

function drawRow(lens, x, y, n, color, alpha) {
  for (var k = 0; k < n; k++) lens.sprite(TILES[color], x + (k + 0.5) * TILE, y, TILE, 0, alpha);
}

function update(lens, dt) {
  var s = lens.screen;
  dt = Math.min(dt, 0.05);
  if (state === "ready" && rows.length === 0) reset();
  // Keep the top of the tower around the middle of the screen.
  var want = Math.max(0, rows.length * TILE - s.top * 0.3);
  scroll += (want - scroll) * Math.min(1, dt * 4);
  if (state === "playing") {
    moving.x += dir * speed * dt;
    if (moving.x < 0) { moving.x = 0; dir = 1; }
    if (moving.x + moving.n * TILE > 1) { moving.x = 1 - moving.n * TILE; dir = -1; }
  }
  for (var i = 0; i < rows.length; i++) drawRow(lens, rows[i].x, rowY(lens, i), rows[i].n, rows[i].color, 1);
  if (state === "playing") drawRow(lens, moving.x, rowY(lens, rows.length), moving.n, moving.color, 1);
  for (var j = falling.length - 1; j >= 0; j--) {
    var fl = falling[j];
    fl.vy += 2.5 * dt;
    fl.y -= fl.vy * dt / TILE;
    if (rowY(lens, fl.y) < 0) { falling.splice(j, 1); continue; }
    drawRow(lens, fl.x, rowY(lens, fl.y), fl.n, fl.color, 0.85);
  }
  lens.text(String(Math.max(0, rows.length - 1)), 0.5, s.top - 0.2, 0.12);
  if (state === "ready") lens.text("Tap to drop the block", 0.5, s.top - 0.32, 0.055);
  if (state === "over") {
    lens.text("Tower of " + (rows.length - 1) + "!", 0.5, s.top - 0.32, 0.075);
    lens.text("Best " + best + " · tap to build again", 0.5, s.top - 0.4, 0.045);
  }
}
