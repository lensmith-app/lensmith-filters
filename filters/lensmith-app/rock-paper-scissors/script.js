// Rock Paper Scissors — play the phone with your real hand. Fist = rock, flat hand = paper,
// peace sign = scissors. Tap (or give a thumbs up) to play a round.
var PICKS = ["rock", "paper", "scissors"];
var FROM = { fist: "rock", open: "paper", peace: "scissors" };
var WORDS = ["Rock…", "Paper…", "Scissors…", "Shoot!"];
var state = "ready", t = 0, said = -1, mine = "", cpu = "", result = "", wins = 0, losses = 0, ties = 0, thumbs = 0;

function icon(pick) {
  return pick === "rock" ? "assets/rock.png" : pick === "paper" ? "assets/paper.png" : "assets/scissors.png";
}

function round(lens) {
  state = "count"; t = 0; said = -1; mine = ""; cpu = ""; result = "";
}

function tap(lens) {
  if (state === "ready" || (state === "result" && t > 0.6)) round(lens);
}

function update(lens, dt) {
  var s = lens.screen;
  var hand = lens.hands.length ? lens.hands[0] : null;
  t += dt;

  // A thumbs up held for a moment starts the next round, hands-free.
  if ((state === "ready" || (state === "result" && t > 1)) && hand && hand.gesture === "thumbsUp") {
    thumbs += dt;
    if (thumbs > 0.4) { thumbs = 0; round(lens); }
  } else thumbs = 0;

  if (state === "count") {
    var word = Math.min(3, Math.floor(t / 0.6));
    if (word !== said) { said = word; lens.sound(word === 3 ? "whip" : "tick", 1, 1 + word * 0.1); }
    lens.text(WORDS[word], 0.5, s.top * 0.62, word === 3 ? 0.13 : 0.1);
    if (t >= 1.8) {
      var seen = hand ? FROM[hand.gesture] : null;
      if (seen) {
        mine = seen;
        cpu = PICKS[Math.floor(lens.random(0, 3))];
        var diff = (PICKS.indexOf(mine) - PICKS.indexOf(cpu) + 3) % 3;
        if (diff === 0) { result = "Tie!"; ties++; lens.sound("ding"); }
        else if (diff === 1) { result = "You win! 🎉"; wins++; lens.sound("win"); lens.burst("⭐", 0.5, s.top * 0.6, 14, "Explode", 0.05); }
        else { result = "Phone wins 🤖"; losses++; lens.sound("lose"); }
        state = "result"; t = 0;
      } else if (t > 3.2) {
        result = "Didn't see your hand 🤷"; state = "result"; t = 0; lens.sound("buzz", 0.6);
      }
    }
  }

  lens.text("You " + wins + " · " + losses + " Phone" + (ties ? " · ties " + ties : ""), 0.5, s.top - 0.2, 0.06);
  if (state === "ready") {
    lens.text("Rock Paper Scissors", 0.5, s.top * 0.7, 0.09);
    lens.text("✊ rock · ✋ paper · ✌️ scissors", 0.5, s.top * 0.62, 0.055);
    lens.text("Tap or 👍 to play", 0.5, s.top * 0.56, 0.05);
  }
  if (state === "result") {
    if (cpu) {
      lens.sprite(icon(cpu), 0.5, s.top * 0.8, 0.22, Math.sin(t * 6) * 4 * Math.max(0, 1 - t));
      lens.text("Phone", 0.5, s.top * 0.8 - 0.16, 0.045);
      // Yours, next to your hand if it's still there.
      var hx = hand ? hand.x : 0.5, hy = hand ? hand.y + hand.size * 0.9 : s.top * 0.45;
      lens.sprite(icon(mine), hx, Math.max(s.top * 0.3, Math.min(s.top * 0.6, hy)), 0.18);
    }
    lens.text(result, 0.5, s.top * 0.64, 0.085);
    if (t > 1) lens.text("Tap or 👍 for another round", 0.5, s.top * 0.57, 0.045);
  }
}
