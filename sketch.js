let song;
let fft;

let playBtn, volumeSlider, volumeIcon;
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

function preload() {
  song = loadSound("assets/song.mp3");

  // Load icons
  playImg = loadImage("img/play.png");
  pauseImg = loadImage("img/pause.png");

  vol0Img = loadImage("img/volume0.png");
  vol25Img = loadImage("img/volume25.png");
  vol50Img = loadImage("img/volume50.png");
  vol100Img = loadImage("img/volume100.png");
}

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("playerContainer");

  fft = new p5.FFT();

  // HTML elements
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);
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

  if (v == 0) {
    volumeIcon.elt.src = "img/volume0.png";
  } else if (v <= 25) {
    volumeIcon.elt.src = "img/volume25.png";
  } else if (v <= 74) {
    volumeIcon.elt.src = "img/volume50.png";
  } else {
    volumeIcon.elt.src = "img/volume100.png";
  }
}

function draw() {
  background(0);

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
