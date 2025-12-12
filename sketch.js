let song; 
let fft;
let waveformData;
let particles = [];

let playBtn, volumeSlider, volumeIcon;
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

// Color scheme
let primaryColor, secondaryColor, bgColor;
let colorShift = 0;

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

  // Initialize color scheme
  primaryColor = color(0, 200, 255);
  secondaryColor = color(255, 0, 128);
  bgColor = color(10, 10, 20);

  fft = new p5.FFT(0.8, 512);
  waveformData = new Array(512).fill(0);

  // HTML elements
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);

  // Initialize particles
  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }
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
  // Dynamic background with subtle gradient
  drawBackground();
  
  // Update color shift for dynamic effects
  colorShift += 0.005;
  
  // Get audio data
  let spectrum = fft.analyze();
  let waveform = fft.waveform();
  
  // Store waveform data for smoothing
  for (let i = 0; i < waveform.length; i++) {
    waveformData[i] = lerp(waveformData[i], waveform[i], 0.3);
  }
  
  // Draw visual elements
  drawWaveform();
  drawFrequencyBars(spectrum);
  drawCircularVisualizer(spectrum);
  updateAndDrawParticles(spectrum);
  
  // Draw title or track info
  drawTrackInfo();
}

function drawBackground() {
  // Create gradient background
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(10, 10, 20), color(30, 10, 40), inter);
    stroke(c);
    line(0, i, width, i);
  }
  
  // Add subtle moving elements
  noStroke();
  fill(255, 5);
  for (let i = 0; i < 5; i++) {
    let x = (frameCount * (i+1) * 0.05) % (width + 100) - 50;
    let y = height/2 + sin(frameCount * 0.01 + i) * 100;
    ellipse(x, y, 50, 50);
  }
}

function drawWaveform() {
  noFill();
  strokeWeight(2);
  
  // Create gradient stroke for waveform
  for (let i = 0; i < waveformData.length - 1; i++) {
    let x1 = map(i, 0, waveformData.length, 0, width);
    let x2 = map(i+1, 0, waveformData.length, 0, width);
    let y1 = map(waveformData[i], -1, 1, height/2 - 50, height/2 + 50);
    let y2 = map(waveformData[i+1], -1, 1, height/2 - 50, height/2 + 50);
    
    // Dynamic color based on position and time
    let r = 255 * sin(colorShift + i * 0.05);
    let g = 200 * sin(colorShift + i * 0.05 + PI/3);
    let b = 255 * sin(colorShift + i * 0.05 + 2*PI/3);
    
    stroke(r, g, b, 150);
    line(x1, y1, x2, y2);
  }
}

function drawFrequencyBars(spectrum) {
  noStroke();
  
  // Sample fewer bars for better performance and aesthetics
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
    
    // Dynamic color based on frequency and amplitude
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

function drawCircularVisualizer(spectrum) {
  push();
  translate(width/2, height/2);
  
  noFill();
  
  // Sample fewer points for circular visualization
  let points = 100;
  let radius = 80;
  
  for (let i = 0; i < points; i++) {
    // Map to spectrum array
    let index = floor(map(i, 0, points, 0, spectrum.length));
    let amp = spectrum[index];
    
    // Calculate angle
    let angle = map(i, 0, points, 0, TWO_PI);
    
    // Calculate radius based on amplitude
    let r = radius + map(amp, 0, 255, 0, 100);
    
    // Calculate position
    let x = r * cos(angle);
    let y = r * sin(angle);
    
    // Dynamic color
    let hue = map(i, 0, points, 0, 360);
    colorMode(HSB);
    stroke(hue, 80, 100, 150);
    strokeWeight(2);
    colorMode(RGB);
    
    // Draw line from center to point
    line(0, 0, x, y);
    
    // Draw point at the end
    point(x, y);
  }
  
  pop();
}

function updateAndDrawParticles(spectrum) {
  // Calculate average amplitude for particle behavior
  let avgAmp = 0;
  for (let i = 0; i < spectrum.length; i++) {
    avgAmp += spectrum[i];
  }
  avgAmp /= spectrum.length;
  
  // Update and draw particles
  for (let particle of particles) {
    particle.update(avgAmp);
    particle.display();
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

// Particle class for additional visual effects
class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
    this.color = color(random(100, 255), random(100, 255), random(100, 255), 100);
    this.life = 255;
  }
  
  update(amp) {
    // Move particle
    this.x += this.speedX;
    this.y += this.speedY;
    
    // React to audio
    this.speedX += map(amp, 0, 255, -0.1, 0.1);
    this.speedY += map(amp, 0, 255, -0.1, 0.1);
    
    // Limit speed
    this.speedX = constrain(this.speedX, -3, 3);
    this.speedY = constrain(this.speedY, -3, 3);
    
    // Wrap around edges
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
    
    // Decrease life
    this.life -= 1;
    
    // Reset if dead
    if (this.life <= 0) {
      this.reset();
    }
  }
  
  display() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.life);
    ellipse(this.x, this.y, this.size);
  }
}
