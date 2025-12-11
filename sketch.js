let song;
let fft;
let playButton;
let volumeSlider;

function preload() {
  song = loadSound("assets/song.mp3"); // change name if needed
}

function setup() {
  createCanvas(800, 400);
  fft = new p5.FFT();

  playButton = createButton("Play / Pause");
  playButton.mousePressed(toggleSong);

  volumeSlider = createSlider(0, 1, 0.5, 0.01);
}

function toggleSong() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function draw() {
  background(0);

  let spectrum = fft.analyze();

  noStroke();
  fill(0, 255, 200);

  for (let i = 0; i < spectrum.length; i += 10) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width / spectrum.length * 10, h);
  }

  song.setVolume(volumeSlider.value());
}
