# Media Player with FFT Visualiser

**A web audio player built with p5.js and p5.sound** plays a single track, shows a real-time audio visualiser, and displays album art.
Controls are inside a YouTube-style bottom overlay with an icon-based play/pause and dynamic volume icons.

Live demo: https://shreyasv0.github.io/mediaplayer  

## Features

- Play / Pause via an icon toggle
- Volume slider with multiple icons sound level  
- Audio visualiser
- Album cover display
- Media player's theme adapts based on the track's album art (Colors of visualiser, background, player outline)
- Control icons auto-hides while media is playing (hover to show)

## How to Use the Player

### **Play / Pause**

* Click the play icon to start playback.
* The icon switches to the pause icon while the music is playing.
* Click again to pause.

### **Volume Control**

* Drag the volume slider left or right to adjust the volume.
* The volume icon updates automatically:
  * **0%** → mute icon
  * **1–25%** → low volume
  * **26–74%** → medium volume
  * **75–100%** → high volume

### **Control Bar Behavior**

* When the audio is **paused**, the control bar remains visible.
* When the audio is **playing**, the control bar hides automatically.
* Move your mouse over the player to reveal the controls again.

### **Visualizer**

* The center area shows a frequency-bar visualization reacting to the music.
* Colors shift based on audio intensity and bar position.

### **Album Art & Background**

* The right side shows the album cover.
* The background gradient and glow effect are generated from the cover image.




## Known Issues / Limitations

* **Only one audio file supported**
  The player is built to load a single track (`assets/song.mp3`). There is no playlist or file-selection interface.

* **Requires supported audio format**
  If `song.mp3` is corrupted or not properly encoded, playback will fail.

* **Album cover must exist**
  The background theme relies on `img/cover.png`. If the image is missing or fails to load, the background will default to a plain color.
