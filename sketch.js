let song; 
let fft;
let coverImg;
let accentColor;

let playBtn, volumeSlider, volumeIcon;
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

function preload() {
  song = loadSound("assets/song.mp3");
  coverImg = loadImage("img/cover.png");

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
  
  // Extract accent color from cover image
  extractAccentColor();

  fft = new p5.FFT(0.8, 256);

  // HTML elements
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);
}

function extractAccentColor() {
  // Sample pixels from the cover image to find dominant color
  coverImg.loadPixels();
  
  let r = 0, g = 0, b = 0;
  let sampleCount = 0;
  
  // Sample from center region of image (avoiding edges)
  let startX = floor(coverImg.width * 0.3);
  let endX = floor(coverImg.width * 0.7);
  let startY = floor(coverImg.height * 0.3);
  let endY = floor(coverImg.height * 0.7);
  
  for (let x = startX; x < endX; x += 5) {
    for (let y = startY; y < endY; y += 5) {
      let index = (x + y * coverImg.width) * 4;
      r += coverImg.pixels[index];
      g += coverImg.pixels[index + 1];
      b += coverImg.pixels[index + 2];
      sampleCount++;
    }
  }
  
  // Calculate average color
  r = floor(r / sampleCount);
  g = floor(g / sampleCount);
  b = floor(b / sampleCount);
  
  accentColor = color(r, g, b);
  
  // Apply accent color to player container
  let playerContainer = select("#playerContainer");
  playerContainer.style("border-color", `rgb(${r}, ${g}, ${b})`);
  playerContainer.style("box-shadow", `0 0 20px rgba(${r}, ${g}, ${b}, 0.3)`);
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
  // Background with accent color
  let r = red(accentColor);
  let g = green(accentColor);
  let b = blue(accentColor);
  
  // Create gradient background using accent color
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(
      color(r * 0.2, g * 0.2, b * 0.2), 
      color(r * 0.5, g * 0.5, b * 0.5), 
      inter
    );
    stroke(c);
    line(0, i, width, i);
  }
  
  // Get audio data
  let spectrum = fft.analyze();
  
  // Draw frequency bars with HSB colors
  drawFrequencyBars(spectrum);
  
  // Draw track info
  drawTrackInfo();
}

function drawFrequencyBars(spectrum) {
  noStroke();
  
  // Sample fewer bars for better aesthetics
  let bars = 64;
  let barWidth = width / bars;
  
  for (let i = 0; i < bars; i++) {
    // Map to spectrum array
    let index = floor(map(i, 0, bars, 0, spectrum.length));
    let amp = spectrum[index];
    
    // Calculate bar height
    let h = map(amp, 0, 255, 0, height * 0.7);
    
    // Calculate position
    let x = i * barWidth;
    let y = height - h;
    
    // Dynamic color using HSB mode for vibrant colors
    let hue = map(i, 0, bars, 200, 280);
    let sat = map(amp, 0, 255, 50, 100);
    let bright = map(amp, 0, 255, 40, 100);
    
    colorMode(HSB);
    fill(hue, sat, bright, 200);
    colorMode(RGB);
    
    // Draw bar with rounded top
    rect(x, y, barWidth - 2, h, 5);
    
    // Add reflection effect
    fill(255, 30);
    rect(x, y, barWidth - 2, h/4, 5);
  }
}

function drawTrackInfo() {
  // Draw track name or info
  fill(255, 200);
  textAlign(CENTER);
  textSize(16);
  text("Audio Visualizer", width/2, 30);
  
  // Draw playback status
  if (song.isPlaying()) {
    text("PLAYING", width/2, 50);
  } else {
    text("PAUSED", width/2, 50);
  }
}
