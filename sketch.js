let song;
let fft;
let amplitude;
let playImg, pauseImg;
let volumeImgs = [];
let particles = [];
let isPlaying = false;
let volume = 0.75;

// Preload function to load all assets
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
  // Create canvas
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  
  // Initialize FFT and amplitude
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();
  
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
  
  // Draw play/pause button
  if (isPlaying) {
    image(pauseImg, width/2 - 30, height - 80, 60, 60);
  } else {
    image(playImg, width/2 - 30, height - 80, 60, 60);
  }
  
  // Draw volume slider background
  fill(60, 60, 70);
  rect(width/2 - 100, height - 40, 200, 10);
  
  // Draw volume slider fill
  fill(100, 200, 255);
  rect(width/2 - 100, height - 40, 200 * volume, 10);
  
  // Draw volume slider handle
  fill(255);
  ellipse(width/2 - 100 + 200 * volume, height - 35, 15, 15);
  
  // Draw volume icon
  let volumeIndex;
  if (volume === 0) volumeIndex = 0;
  else if (volume <= 0.25) volumeIndex = 1;
  else if (volume <= 0.5) volumeIndex = 2;
  else if (volume <= 0.75) volumeIndex = 3;
  else volumeIndex = 4;
  
  image(volumeImgs[volumeIndex], width/2 - 130, height - 50, 25, 25);
  
  // Draw song title placeholder
  fill(255);
  textAlign(CENTER);
  textSize(16);
  text("Now Playing: Your Song", width/2, height - 100);
}

function mousePressed() {
  // Check if play/pause button is clicked
  if (mouseX > width/2 - 30 && mouseX < width/2 + 30 && 
      mouseY > height - 80 && mouseY < height - 20) {
    togglePlayPause();
  }
  
  // Check if volume slider is clicked
  if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
      mouseY > height - 45 && mouseY < height - 25) {
    updateVolume();
  }
}

function mouseDragged() {
  // Check if volume slider is being dragged
  if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
      mouseY > height - 45 && mouseY < height - 25) {
    updateVolume();
  }
}

function togglePlayPause() {
  if (isPlaying) {
    song.pause();
    isPlaying = false;
  } else {
    song.play();
    isPlaying = true;
  }
}

function updateVolume() {
  volume = map(mouseX, width/2 - 100, width/2 + 100, 0, 1);
  volume = constrain(volume, 0, 1);
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
