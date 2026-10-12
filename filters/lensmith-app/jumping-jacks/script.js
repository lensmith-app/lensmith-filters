// Jumping Jacks — prop your phone up, step back until your arms fit on screen, and do as many
// jumping jacks as you can in 30 seconds. Raise both arms to start.
var LENGTH = 30;
var BONES = [["leftShoulder", "rightShoulder"], ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"], ["leftShoulder", "leftHip"], ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"], ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]];
var state = "ready", t = 0, reps = 0, armsUp = false, best = 0, countdown = 0, said = -1, endTime = -9;

function seen(p) { return p && p.visible; }

function tap(lens) {
  if (state === "over" && lens.time - endTime > 1) state = "ready";
}

function update(lens, dt) {
  var s = lens.screen;
  var p = lens.pose;

  // Arms up: both wrists above the nose. Arms down: both wrists below the shoulders.
  var up = false, down = false;
  if (p && seen(p.leftWrist) && seen(p.rightWrist) && seen(p.nose)) {
    up = p.leftWrist.y > p.nose.y && p.rightWrist.y > p.nose.y;
    down = seen(p.leftShoulder) && seen(p.rightShoulder) && p.leftWrist.y < p.leftShoulder.y && p.rightWrist.y < p.rightShoulder.y;
  }

  if (state === "ready" && up) { state = "countdown"; countdown = 3; said = -1; }
  if (state === "countdown") {
    countdown -= dt;
    var n = Math.ceil(countdown);
    if (n !== said && n > 0) { said = n; lens.sound("tick", 1, 1 + (3 - n) * 0.15); }
    lens.text(n > 0 ? String(n) : "GO!", 0.5, s.top * 0.6, 0.18);
    if (countdown <= 0) { state = "playing"; t = 0; reps = 0; armsUp = false; lens.sound("whip"); lens.music("beat", 0.4); }
  }
  if (state === "playing") {
    t += dt;
    if (up && !armsUp) {
      armsUp = true;
      reps++;
      lens.sound("coin", 0.8, Math.min(2, 1 + reps * 0.01));
      if (p) lens.burst("✨", (p.leftWrist.x + p.rightWrist.x) / 2, Math.max(p.leftWrist.y, p.rightWrist.y), 6, "Explode", 0.04);
    }
    if (down) armsUp = false;
    if (t >= LENGTH) { state = "over"; endTime = lens.time; best = Math.max(best, reps); lens.music(null); lens.sound("win"); }
  }

  // The skeleton, so you can see what the phone sees.
  if (p) {
    for (var i = 0; i < BONES.length; i++) {
      var a = p[BONES[i][0]], b = p[BONES[i][1]];
      if (!seen(a) || !seen(b)) continue;
      for (var k = 1; k < 6; k++) lens.sprite("assets/bone.png", a.x + (b.x - a.x) * k / 6, a.y + (b.y - a.y) * k / 6, 0.025, 0, 0.8);
    }
    var joints = ["nose", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
    for (var j = 0; j < joints.length; j++) if (seen(p[joints[j]])) lens.sprite("assets/joint.png", p[joints[j]].x, p[joints[j]].y, 0.045);
  }

  if (state === "playing") {
    lens.text(String(reps), 0.5, s.top - 0.3, 0.16);
    lens.text(Math.max(0, LENGTH - t).toFixed(0) + "s", 0.5, s.top - 0.42, 0.06);
  }
  if (state === "ready") {
    lens.text("Jumping Jacks", 0.5, s.top - 0.22, 0.1);
    lens.text(p ? "Raise both arms to start 🙌" : "Step back so your whole upper body shows", 0.5, s.top - 0.32, 0.05);
  }
  if (state === "over") {
    lens.text(reps + " jumping jacks!", 0.5, s.top - 0.26, 0.09);
    lens.text("Best " + best + " · tap, then raise your arms", 0.5, s.top - 0.36, 0.045);
  }
}
