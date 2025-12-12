let song; 
let fft;
let coverImg;
let dominantColor;
let bgGraphics; // For static background

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
  
  // Extract dominant color from cover image
  extractDominantColor();
  
  // Create static background graphics
  createStaticBackground();

  fft = new p5.FFT(0.8, 256);

  // HTML elements
  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);
}

function extractDominantColor() {
  // Load pixels for analysis
  coverImg.loadPixels();
  
  // Create a color frequency map
  let colorMap = {};
  
  // Sample pixels from the entire image
  // Using a step to improve performance
  let step = 5;
  
  for (let x = 0; x < coverImg.width; x += step) {
    for (let y = 0; y < coverImg.height; y += step) {
      let index = (x + y * coverImg.width) * 4;
      let r = coverImg.pixels[index];
      let g = coverImg.pixels[index + 1];
      let b = coverImg.pixels[index + 2];
      
      // Quantize colors to reduce variations
      // This groups similar colors together
      r = Math.floor(r / 10) * 10;
      g = Math.floor(g / 10) * 10;
      b = Math.floor(b / 10) * 10;
      
      // Create a color key
      let colorKey = `${r},${g},${b}`;
      
      // Increment count for this color
      if (colorMap[colorKey]) {
        colorMap[colorKey]++;
      } else {
        colorMap[colorKey] = 1;
      }
    }
  }
  
  // Find the color with the highest count
  let maxCount = 0;
  let dominantColorKey = "";
  
  for (let key in colorMap) {
    if (colorMap[key] > maxCount) {
      maxCount = colorMap[key];
      dominantColorKey = key;
    }
  }
  
  // Extract RGB values from the key
  let rgb = dominantColorKey.split(",").map(Number);
  dominantColor = color(rgb[0], rgb[1], rgb[2]);
  
  // Apply dominant color to player container
  let playerContainer = select("#playerContainer");
  playerContainer.style("border-color", `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
  playerContainer.style("box-shadow", `0 0 20px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`);
}

function createStaticBackground() {
  // Create a graphics buffer for the static background
  bgGraphics = createGraphics(width, height);
  
  // Get RGB values from dominant color
  let r = red(dominantColor);
  let g = green(dominantColor);
  let b = blue(dominantColor);
  
  // Create gradient with darker shades
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    
    // Mix between lighter and darker shades
    let lightShade = color(r * 0.4 + 100, g * 0.4 + 100, b * 0.4 + 100);
    let darkShade = color(r * 0.2, g * 0.2, b * 0.2);
    
    let c = lerpColor(lightShade, darkShade, inter);
    
    bgGraphics.stroke(c);
    bgGraphics.line(0, i, width, i);
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
  // Draw the static background
  image(bgGraphics, 0, 0);
  
  // Apply blur effect to the background
  drawingContext.filter = 'blur(4px)';
  image(bgGraphics, 0, 0);
  drawingContext.filter = 'none';
  
  // Get audio data
  let spectrum = fft.analyze();
  
  // Draw frequency bars with HSB colors
  drawFrequencyBars(spectrum);
  
  // Draw cover image on the right side
  drawCoverImage();
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

function drawCoverImage() {
  push();
  imageMode(CENTER);
  
  // Calculate size - make it bigger than before
  let maxSize = min(width, height) * 0.7;
  let imgWidth = coverImg.width;
  let imgHeight = coverImg.height;
  
  let scale = maxSize / max(imgWidth, imgHeight);
  let displayWidth = imgWidth * scale;
  let displayHeight = imgHeight * scale;
  
  // Position to the right side of the canvas
  let xPos = width * 0.75;
  let yPos = height / 2;
  
  // Add glow border effect using the dominant color
  let r = red(dominantColor);
  let g = green(dominantColor);
  let b = blue(dominantColor);
  
  drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
  drawingContext.shadowBlur = 25;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  
  // Draw the image
  image(coverImg, xPos, yPos, displayWidth, displayHeight);
  
  // Reset shadow
  drawingContext.shadowBlur = 0;
  
  pop();
}
