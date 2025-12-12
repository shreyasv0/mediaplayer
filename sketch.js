let song; 
let fft;
let coverImg;
let dominantColor;
let bgGraphics;

let playBtn, volumeSlider, volumeIcon;
let playImg, pauseImg;
let vol0Img, vol25Img, vol50Img, vol100Img;

function preload() {
  song = loadSound("assets/song.mp3");
  coverImg = loadImage("img/cover.png");

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
  

  extractDominantColor();
  

  createStaticBackground();

  fft = new p5.FFT(0.8, 256);


  playBtn = select("#playBtn");
  volumeSlider = select("#volumeSlider");
  volumeIcon = select("#volumeIcon");

  playBtn.mousePressed(togglePlay);
  volumeSlider.input(updateVolumeIcon);
}

function extractDominantColor() {

  coverImg.loadPixels();
  
  let colorMap = {};
  
  let step = 5;
  
  for (let x = 0; x < coverImg.width; x += step) {
    for (let y = 0; y < coverImg.height; y += step) {
      let index = (x + y * coverImg.width) * 4;
      let r = coverImg.pixels[index];
      let g = coverImg.pixels[index + 1];
      let b = coverImg.pixels[index + 2];
      

      r = Math.floor(r / 10) * 10;
      g = Math.floor(g / 10) * 10;
      b = Math.floor(b / 10) * 10;
      

      let colorKey = `${r},${g},${b}`;
      

      if (colorMap[colorKey]) {
        colorMap[colorKey]++;
      } else {
        colorMap[colorKey] = 1;
      }
    }
  }
  
  let maxCount = 0;
  let dominantColorKey = "";
  
  for (let key in colorMap) {
    if (colorMap[key] > maxCount) {
      maxCount = colorMap[key];
      dominantColorKey = key;
    }
  }
  
  let rgb = dominantColorKey.split(",").map(Number);
  dominantColor = color(rgb[0], rgb[1], rgb[2]);
  
  let playerContainer = select("#playerContainer");
  playerContainer.style("border-color", `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
  playerContainer.style("box-shadow", `0 0 20px rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`);
}

function createStaticBackground() {
  bgGraphics = createGraphics(width, height);
  
  let r = red(dominantColor);
  let g = green(dominantColor);
  let b = blue(dominantColor);
  
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    
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
    select("#controls").removeClass("playing");
  } else {
    song.play();
    playBtn.elt.src = "img/pause.png";
    select("#controls").addClass("playing");
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
  image(bgGraphics, 0, 0);
  
  drawingContext.filter = 'blur(4px)';
  image(bgGraphics, 0, 0);
  drawingContext.filter = 'none';
  
  let spectrum = fft.analyze();
  
  drawFrequencyBars(spectrum);
  
  drawCoverImage();
}

function drawFrequencyBars(spectrum) {
  noStroke();
  
  let bars = 64;
  let barWidth = width / bars;
  
  for (let i = 0; i < bars; i++) {
    let index = floor(map(i, 0, bars, 0, spectrum.length));
    let amp = spectrum[index];
    
    let h = map(amp, 0, 255, 0, height * 0.7);
    
    let x = i * barWidth;
    let y = height - h;
    
    let hue = map(i, 0, bars, 200, 280);
    let sat = map(amp, 0, 255, 50, 100);
    let bright = map(amp, 0, 255, 40, 100);
    
    colorMode(HSB);
    fill(hue, sat, bright, 200);
    colorMode(RGB);
    
    rect(x, y, barWidth - 2, h, 5);
    
    fill(255, 30);
    rect(x, y, barWidth - 2, h/4, 5);
  }
}

function drawCoverImage() {
  push();
  imageMode(CENTER);
  
  let maxSize = min(width, height) * 0.7;
  let imgWidth = coverImg.width;
  let imgHeight = coverImg.height;
  
  let scale = maxSize / max(imgWidth, imgHeight);
  let displayWidth = imgWidth * scale;
  let displayHeight = imgHeight * scale;
  
  let xPos = width * 0.75;
  let yPos = height / 2;
  
  let r = red(dominantColor);
  let g = green(dominantColor);
  let b = blue(dominantColor);
  
  drawingContext.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
  drawingContext.shadowBlur = 25;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  
  image(coverImg, xPos, yPos, displayWidth, displayHeight);
  
  drawingContext.shadowBlur = 0;
  
  pop();
}


