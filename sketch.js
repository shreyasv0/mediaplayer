let song;
let fft;
let playPauseButton;
let volumeSlider;
let playImg, pauseImg;
let volumeImgs = [];
let currentVolumeImg;
let amplitude;
let particles = [];

function preload() {
  // Load your audio file
  song = loadSound('assets/song.mp3');
  
  // Load images
  playImg = loadImage('img/play.png');
  pauseImg = loadImage('img/pause.png');
  
  // Load volume images
  for (let i = 0; i <= 100; i += 25) {
    volumeImgs.push(loadImage(`img/volume${i}.png`));
  }
}

function setup() {
  createCanvas(800, 600);
  
  // Initialize FFT
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  
  // Set initial volume image
  currentVolumeImg = volumeImgs[3]; // Default to 75% volume
  
  // Create play/pause button
  playPauseButton = createButton('');
  playPauseButton.position(width/2 - 30, height - 80);
  playPauseButton.size(60, 60);
  playPauseButton.style('background-image', `url(${playImg.src})`);
  playPauseButton.style('background-size', 'cover');
  playPauseButton.style('background-color', 'transparent');
  playPauseButton.style('border', 'none');
  playPauseButton.mousePressed(togglePlayPause);
  
  // Create volume slider
  volumeSlider = createSlider(0, 100, 75);
  volumeSlider.position(width/2 - 100, height - 40);
  volumeSlider.size(200);
  volumeSlider.input(updateVolume);
  
  // Set initial volume
  song.setVolume(0.75);
  
  // Create particles for visual effect
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // Dark background with slight transparency for trail effect
  background(20, 20, 30, 25);
  
  // Get waveform data
  let waveform = fft.waveform();
  let spectrum = fft.analyze();
  
  // Draw visualizer
  drawWaveform(waveform);
  drawSpectrum(spectrum);
  
  // Update and draw particles
  let level = amplitude.getLevel();
  for (let particle of particles) {
    particle.update(level);
    particle.display();
  }
  
  // Draw UI elements
  drawPlayerUI();
}

function drawWaveform(waveform) {
  // Draw waveform as a series of lines
  stroke(100, 200, 255, 150);
  strokeWeight(2);
  noFill();
  
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height/2, height/2 - 100);
    vertex(x, y);
  }
  endShape();
}

function drawSpectrum(spectrum) {
  // Draw frequency spectrum as bars
  noStroke();
  
  // Calculate bar width based on spectrum length
  let barWidth = width / spectrum.length * 2.5;
  
  for (let i = 0; i < spectrum.length; i++) {
    // Map amplitude to height
    let amp = spectrum[i];
    let h = map(amp, 0, 255, 0, height/2 - 100);
    
    // Calculate color based on frequency
    let r = map(i, 0, spectrum.length, 100, 255);
    let g = map(i, 0, spectrum.length, 50, 150);
    let b = map(i, 0, spectrum.length, 200, 255);
    
    // Draw bar with gradient effect
    for (let j = 0; j < h; j++) {
      let alpha = map(j, 0, h, 200, 50);
      fill(r, g, b, alpha);
      rect(i * barWidth, height/2 + j, barWidth - 2, 1);
    }
  }
}

function drawPlayerUI() {
  // Draw player background
  fill(30, 30, 40, 200);
  noStroke();
  rect(0, height - 120, width, 120);
  
  // Draw song title placeholder
  fill(255);
  textAlign(CENTER);
  textSize(16);
  text("Now Playing: Your Song", width/2, height - 100);
  
  // Update volume icon based on slider value
  let volumeValue = volumeSlider.value();
  let volumeIndex;
  if (volumeValue === 0) volumeIndex = 0;
  else if (volumeValue <= 25) volumeIndex = 1;
  else if (volumeValue <= 50) volumeIndex = 2;
  else if (volumeValue <= 75) volumeIndex = 3;
  else volumeIndex = 4;
  
  // Draw volume icon
  image(volumeImgs[volumeIndex], width/2 - 130, height - 55, 25, 25);
}

function togglePlayPause() {
  if (song.isPlaying()) {
    song.pause();
    playPauseButton.style('background-image', `url(${playImg.src})`);
  } else {
    song.play();
    playPauseButton.style('background-image', `url(${pauseImg.src})`);
  }
}

function updateVolume() {
  let volume = volumeSlider.value() / 100;
  song.setVolume(volume);
}

// Particle class for visual effects
class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(width);
    this.y = random(height/2);
    this.size = random(1, 3);
    this.speedX = random(-0.5, 0.5);
    this.speedY = random(-0.5, 0.5);
    this.color = color(random(100, 255), random(100, 255), random(200, 255), random(100, 200));
  }
  
  update(audioLevel) {
    // Move particle
    this.x += this.speedX;
    this.y += this.speedY;
    
    // React to audio
    this.size = map(audioLevel, 0, 1, 1, 5);
    
    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height/2;
    if (this.y > height/2) this.y = 0;
  }
  
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }
}
