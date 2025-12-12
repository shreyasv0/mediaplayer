let song;
let fft;

// UI elements
let playBtn, volumeSlider, volumeIcon;

// Icons
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

// Album art + extracted color
let albumCover;
let accentColor;

function preload() {
  song = loadSound("assets/song.mp3");

  // Load icons
  playImg = loadImage("img/play.png");
  pauseImg = loadImage("img/pause.png");

  vol0Img = loadImage("img/volume0.png");
  vol25Img = loadImage("img/volume25.png");
  vol50Img = loadImage("img/volume50.png");
  vol100Img = loadImage("img/volume100.png");

  // Album cover
  albumCover = loadImage("img/cover.jpg");
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("playerContainer");

  fft = new p5.FFT();

  // UI connections
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);

  // Extract average color from album cover (accent)
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
  // 1. Draw album art as the main background
  image(albumCover, 0, 0, width, height);

  // 2. Blurred accent glow from album art
  drawAccentGlow();

  // 3. Draw FFT visualizer on top
  let spectrum = fft.analyze();

  noStroke();
  fill(255);

  let barWidth = width / spectrum.length * 4;

  for (let i = 0; i < spectrum.length; i += 4) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, barWidth, h);
  }
}

// ----------------------------------
// FUNCTIONS FOR COLOR + GLOW EFFECT
// ----------------------------------

function getAverageColor(img) {
  img.loadPixels();

  let r = 0, g = 0, b = 0;
  let count = img.width * img.height;

  for (let i = 0; i < img.pixels.length; i += 4) {
    r += img.pixels[i];
    g += img.pixels[i + 1];
    b += img.pixels[i + 2];
  }

  return color(r / count, g / count, b / count);
}

function drawAccentGlow() {
  push();
  noStroke();

  // Gradient-like blur circles
  for (let i = 600; i > 0; i -= 40) {
    let alpha = map(i, 600, 0, 20, 180);
    fill(red(accentColor), green(accentColor), blue(accentColor), alpha);
    ellipse(width / 2, height / 2, i);
  }

  pop();

  // Darken slightly to keep visualizer readable
  fill(0, 100);
  rect(0, 0, width, height);
}
