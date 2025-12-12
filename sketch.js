let song;
let fft;

let playBtn, volumeSlider, volumeIcon;
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

// NEW — album cover + color
let albumCover;
let accentColor;

function preload() {
  song = loadSound("assets/song.mp3");

  // Icons
  playImg = loadImage("img/play.png");
  pauseImg = loadImage("img/pause.png");

  vol0Img = loadImage("img/volume0.png");
  vol25Img = loadImage("img/volume25.png");
  vol50Img = loadImage("img/volume50.png");
  vol100Img = loadImage("img/volume100.png");

  // NEW — album cover image
  albumCover = loadImage("img/cover.jpg");
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("playerContainer");

  fft = new p5.FFT();

  // HTML connections
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);

  // NEW — extract accent color from album cover
  accentColor = getAverageColor(albumCover);
}

function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
    playBtn.elt.src = "img/play.png";
  } else {
    song.play();
    playBtn.elt.src = "img/pause.png";
  }
}

function updateVolumeIcon() {
  let v = volumeSlider.value();
  song.setVolume(v / 100);

  if (v == 0) volumeIcon.elt.src = "img/volume0.png";
  else if (v <= 25) volumeIcon.elt.src = "img/volume25.png";
  else if (v <= 74) volumeIcon.elt.src = "img/volume50.png";
  else volumeIcon.elt.src = "img/volume100.png";
}

function draw() {
  // ---- NEW BACKGROUND ----

  // Album cover full background
  image(albumCover, 0, 0, width, height);

  // Blurred accent glow behind visualizer
  drawAccentGlow();

  // Slight dark overlay to make bars readable
  fill(0, 100);
  noStroke();
  rect(0, 0, width, height);

  // ---- ORIGINAL VISUALIZER ----
  let spectrum = fft.analyze();
  noStroke();
  fill(0, 200, 255);

  let barWidth = width / spectrum.length * 4;

  for (let i = 0; i < spectrum.length; i += 4) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, barWidth, h);
  }
}

// ------------------------------------------
// NEW FUNCTIONS below (color + blurred glow)
// ------------------------------------------

function getAverageColor(img) {
  img.loadPixels();

  let r = 0, g = 0, b = 0;
  const total = img.width * img.height;

  for (let i = 0; i < img.pixels.length; i += 4) {
    r += img.pixels[i];
    g += img.pixels[i + 1];
    b += img.pixels[i + 2];
  }

  return color(r / total, g / total, b / total);
}

function drawAccentGlow() {
  push();
  noStroke();

  // Large soft glow, centered
  for (let d = 800; d > 0; d -= 50) {
    let alpha = map(d, 800, 0, 10, 150);
    fill(red(accentColor), green(accentColor), blue(accentColor), alpha);
    ellipse(width / 2, height / 2, d);
  }

  pop();
}
