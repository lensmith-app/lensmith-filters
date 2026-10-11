// Memory Match — tap two cards to flip them. Find all six pairs in as few moves as possible!
var FACES = ["assets/card-sun.png", "assets/card-heart.png", "assets/card-moon.png", "assets/card-bolt.png", "assets/card-leaf.png", "assets/card-drop.png"];
var COLS = 3, ROWS = 4, CW = 0.24;   // card width shrinks to fit shorter screens
var cards = [], open = [], moves = 0, matched = 0, state = "ready", t = 0, best = 0, hideAt = -1;

function deal(lens) {
  var deck = FACES.concat(FACES);
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(lens.random(0, i + 1));
    var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
  }
  var s = lens.screen;
  CW = Math.min(0.24, (s.top * 0.68) / (ROWS * 1.36));
  cards = [];
  for (var k = 0; k < deck.length; k++) {
    var c = k % COLS, r = Math.floor(k / COLS);
    cards.push({ face: deck[k], x: 0.5 + (c - 1) * (CW + 0.04), y: s.top - 0.3 - CW * 0.67 - r * (CW * 1.33 + 0.03), up: false, done: false, flip: 0 });
  }
  open = []; moves = 0; matched = 0; t = 0; hideAt = -1;
}

function tap(lens, x, y) {
  if (state !== "playing") { deal(lens); state = "playing"; return; }
  if (open.length === 2) return;                 // wait for the pair to flip back
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    if (c.up || c.done) continue;
    if (Math.abs(x - c.x) < CW / 2 && Math.abs(y - c.y) < CW * 0.67) {
      c.up = true; open.push(c);
      if (open.length === 2) {
        moves++;
        if (open[0].face === open[1].face) {
          open[0].done = open[1].done = true; matched++;
          lens.burst("✨", (open[0].x + open[1].x) / 2, (open[0].y + open[1].y) / 2, 10, "Explode", 0.04);
          open = [];
          if (matched === FACES.length) { state = "won"; best = best ? Math.min(best, moves) : moves; lens.flash(1, 0.9, 0.6); }
        } else hideAt = lens.time + 0.8;
      }
      return;
    }
  }
}

function update(lens, dt) {
  var s = lens.screen;
  if (state === "ready" && cards.length === 0) deal(lens);
  if (state === "playing") t += dt;
  if (hideAt > 0 && lens.time >= hideAt) {
    for (var i = 0; i < open.length; i++) open[i].up = false;
    open = []; hideAt = -1;
  }
  for (var k = 0; k < cards.length; k++) {
    var c = cards[k];
    // Flip animation: squash to nothing, swap the picture, grow back.
    var target = c.up || c.done ? 1 : 0;
    c.flip += (target - c.flip) * Math.min(1, dt * 12);
    var squash = Math.abs(c.flip - 0.5) * 2;
    var art = c.flip > 0.5 ? c.face : "assets/back.png";
    lens.sprite(art, c.x, c.y, CW * Math.max(0.05, squash), 0, c.done ? 0.75 : 1);
  }
  lens.text("Moves " + moves + " · " + Math.floor(t) + "s", 0.5, s.top - 0.18, 0.06);
  if (state === "ready") lens.text("Tap to deal · find the pairs!", 0.5, s.top * 0.25, 0.05);
  if (state === "won") {
    lens.text("All pairs in " + moves + " moves!", 0.5, s.top * 0.27, 0.07);
    lens.text("Best " + best + " · tap to deal again", 0.5, s.top * 0.21, 0.045);
  }
}
