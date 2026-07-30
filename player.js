/**
 * player.js - Global Persistent Audio Engine & Client-Side SPA Router for One Circle
 * Upgraded with Spotify-style UI, Shuffle, Loop, Device Picker, and robust State Persistence.
 */
(function() {
    // Prevent duplicate injection
    if (document.getElementById('globalAudioPlayerRoot')) return;

    const playerContainer = document.createElement('div');
    playerContainer.id = 'globalAudioPlayerRoot';
    playerContainer.innerHTML = `
        <style>
          #persistentPlayer {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
            background: #121212; color: #fff; font-family: 'DM Sans', sans-serif;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.5); user-select: none;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .player-minimized {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 16px; height: 72px; max-width: 1400px; margin: 0 auto; cursor: pointer;
          }
          .player-maximized {
            position: fixed; inset: 0; background: linear-gradient(180deg, #1e293b 0%, #0c1220 40%, #0a0a0b 100%);
            z-index: 100000; display: flex; flex-direction: column; justify-content: space-between;
            padding: 30px 20px 40px 20px; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-sizing: border-box; overflow-y: auto; opacity: 0; pointer-events: none;
          }
          .player-maximized.active { transform: translateY(0); opacity: 1; pointer-events: auto; }
          
          /* Utility classes for Spotify Controls */
          .spotify-btn { background: none; border: none; color: #aaa398; cursor: pointer; transition: color 0.2s, transform 0.1s; padding: 6px; display: inline-flex; align-items: center; justify-content: center; }
          .spotify-btn:hover { color: #fff; transform: scale(1.08); }
          .spotify-btn.active { color: #d8a64d !important; }
          .spotify-btn.active svg { fill: currentColor; }

          .device-select-popup {
            display: none; position: absolute; bottom: 70px; right: 20px; background: #181818;
            border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 12px; z-index: 100002;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8); width: 260px; font-size: 13px; color: #f5efe5;
          }
          .device-select-popup.open { display: block; }
          .device-select-popup select {
            width: 100%; background: #282828; color: #fff; border: 1px solid #444; padding: 8px; border-radius: 6px; margin-top: 8px; outline: none; font-family: inherit;
          }
        </style>

        <!-- Initially set to display: none so it only appears when a track is clicked -->
        <div id="persistentPlayer" style="display: none;">
           <!-- MINIMIZED BAR -->
           <div class="player-minimized" id="expandTrigger">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                 <img id="miniImg" src="" alt="Art" style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover; background: #222; flex-shrink: 0;">
                 <div style="min-width: 0;">
                    <h4 id="miniTitle" style="margin: 0; font-size: 14px; font-weight: 700; color: #f5efe5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></h4>
                    <p id="miniArtist" style="margin: 2px 0 0 0; font-size: 12px; color: #aaa398; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></p>
                 </div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                 <button id="miniPlayBtn" class="spotify-btn" style="width: 40px; height: 40px; background: #f5efe5; color: #0a0a0b; border-radius: 50%;">
                    <svg id="miniPlayIcon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </button>
              </div>
           </div>

           <!-- MAXIMIZED SPOTIFY FULLSCREEN UI -->
           <div class="player-maximized" id="maximizedPlayer">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 600px; margin: 0 auto;">
                 <button id="collapseBtn" class="spotify-btn" title="Collapse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                 </button>
                 <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #aaa398;">Now Playing</span>
                 <div style="width: 24px;"></div>
              </div>

              <div id="swipeArea" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: auto; text-align: center;">
                 <img id="maxImg" src="" alt="Album Art" style="width: 100%; aspect-ratio: 1/1; max-width: 340px; border-radius: 12px; object-fit: cover; box-shadow: 0 20px 50px rgba(0,0,0,0.6); margin-bottom: 28px;">
                 <div style="width: 100%; text-align: left; margin-bottom: 20px;">
                    <h2 id="maxTitle" style="margin: 0; font-size: 24px; font-weight: 700; color: #f5efe5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></h2>
                    <p id="maxArtist" style="margin: 6px 0 0 0; font-size: 15px; color: #aaa398; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></p>
                 </div>

                 <!-- Progress Bar -->
                 <div style="width: 100%; margin-bottom: 24px;">
                    <input type="range" id="progressBar" value="0" min="0" max="100" step="0.1" style="width: 100%; accent-color: #d8a64d; cursor: pointer; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #aaa398; margin-top: 6px;">
                       <span id="currentTime">0:00</span>
                       <span id="durationTime">0:00</span>
                    </div>
                 </div>

                 <!-- SPOTIFY CONTROLS ROW -->
                 <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 10px;">
                    <button id="shuffleBtn" class="spotify-btn" title="Enable Shuffle">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                    </button>
                    <button id="prevBtn" class="spotify-btn" title="Previous Track">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2"></line></svg>
                    </button>
                    <button id="maxPlayBtn" class="spotify-btn" style="width: 64px; height: 64px; background: #f5efe5; color: #0a0a0b; border-radius: 50%; box-shadow: 0 8px 20px rgba(0,0,0,0.4);" title="Play/Pause">
                       <svg id="maxPlayIcon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button id="nextBtn" class="spotify-btn" title="Next Track">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2"></line></svg>
                    </button>
                    <button id="loopBtn" class="spotify-btn" title="Enable Loop">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                    </button>
                 </div>
              </div>

              <!-- BOTTOM ANCHOR CONTROLS (Audio Device Picker) -->
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 600px; margin: 0 auto; position: relative;">
                 <button id="devicePickerBtn" class="spotify-btn" title="Connect to a Device">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                 </button>
                 
                 <!-- Audio Output Device Select Popup Menu -->
                 <div id="devicePopup" class="device-select-popup">
                    <span style="font-weight: 700; color: #d8a64d;">Select Audio Output</span>
                    <select id="audioOutputSelect">
                       <option value="">Default System Speaker</option>
                    </select>
                 </div>

                 <span style="font-size: 12px; color: #aaa398;">One Circle Audio Engine</span>
              </div>
           </div>
        </div>
    `;
    document.body.appendChild(playerContainer);

    class GlobalPersistentPlayer {
        constructor() {
            this.currentTrack = null;
            this.isPlaying = false;
            this.isExpanded = false;
            this.playlist = [];
            this.currentIndex = 0;
            
            // Spotify specific states
            this.isShuffle = false;
            this.loopMode = 0; // 0: Off, 1: Loop All, 2: Loop One
            this.shuffledIndices = [];

            this.audio = document.createElement('audio');
            document.body.appendChild(this.audio);

            this.initListeners();
            this.restoreState();
            this.loadAudioDevices();
        }

        initListeners() {
            // Expansion toggles
            document.getElementById('expandTrigger').addEventListener('click', () => this.setExpanded(true));
            document.getElementById('collapseBtn').addEventListener('click', () => this.setExpanded(false));

            // Play / Pause toggles
            document.getElementById('miniPlayBtn').addEventListener('click', (e) => { e.stopPropagation(); this.togglePlay(); });
            document.getElementById('maxPlayBtn').addEventListener('click', () => this.togglePlay());

            // Skip controls
            document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());
            document.getElementById('prevBtn').addEventListener('click', () => this.prevTrack());

            // Shuffle & Loop toggles
            document.getElementById('shuffleBtn').addEventListener('click', () => this.toggleShuffle());
            document.getElementById('loopBtn').addEventListener('click', () => this.toggleLoop());

            // Audio Device Picker toggle
            const deviceBtn = document.getElementById('devicePickerBtn');
            const devicePopup = document.getElementById('devicePopup');
            deviceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                devicePopup.classList.toggle('open');
            });
            document.addEventListener('click', () => devicePopup.classList.remove('open'));
            devicePopup.addEventListener('click', (e) => e.stopPropagation());

            // Audio Output Device Selection handler
            const outputSelect = document.getElementById('audioOutputSelect');
            outputSelect.addEventListener('change', async (e) => {
                const deviceId = e.target.value;
                if (typeof this.audio.setSinkId === 'function') {
                    try {
                        await this.audio.setSinkId(deviceId);
                    } catch (err) {
                        console.error("Error setting audio output device:", err);
                    }
                } else {
                    alert("Your browser does not support audio output device switching.");
                }
            });

            // Audio element native events
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
                this.saveState(); // Saves currentTime persistently
            });
            this.audio.addEventListener('ended', () => this.handleTrackEnded());

            // Scrub bar progress control
            const progressBar = document.getElementById('progressBar');
            progressBar.addEventListener('input', (e) => {
                if (this.audio.duration) {
                    this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
                }
            });
        }

        async loadAudioDevices() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
                const select = document.getElementById('audioOutputSelect');
                select.innerHTML = '<option value="">Default System Speaker</option>';
                audioOutputs.forEach(device => {
                    const opt = document.createElement('option');
                    opt.value = device.deviceId;
                    opt.textContent = device.label || `Speaker (${device.deviceId.slice(0, 4)}...)`;
                    select.appendChild(opt);
                });
            } catch (err) {
                console.error("Could not load audio output devices:", err);
            }
        }

        setExpanded(expand) {
            this.isExpanded = expand;
            const maxEl = document.getElementById('maximizedPlayer');
            if (expand) {
                maxEl.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                maxEl.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        playTrack(track, playlist = [], index = 0) {
            this.currentTrack = track;
            this.playlist = playlist.length ? playlist : [track];
            this.currentIndex = index;

            document.getElementById('persistentPlayer').style.display = 'block';

            if (this.currentTrack.file || this.currentTrack.audioUrl) {
                this.audio.src = this.currentTrack.file || this.currentTrack.audioUrl;
                this.audio.play().then(() => {
                    this.isPlaying = true;
                    this.updateUIState();
                    this.saveState();
                }).catch(err => console.error("Playback error:", err));
            } else {
                this.audio.pause();
                this.isPlaying = false;
                this.updateUIState();
            }
        }

        togglePlay() {
            if (!this.currentTrack) return;
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
            } else {
                this.audio.play();
                this.isPlaying = true;
            }
            this.updateUIState();
            this.saveState();
        }

        updateUIState() {
            if (!this.currentTrack) return;
            
            const img = this.currentTrack.image || 'https://images.pexels.com/photos/7708458/pexels-photo-7708458.jpeg';
            const title = this.currentTrack.title || 'Unknown Track';
            const artist = this.currentTrack.artist || 'One Circle';

            // Update Text and Images
            document.getElementById('miniTitle').textContent = title;
            document.getElementById('miniArtist').textContent = artist;
            document.getElementById('miniImg').src = img;

            document.getElementById('maxTitle').textContent = title;
            document.getElementById('maxArtist').textContent = artist;
            document.getElementById('maxImg').src = img;

            // Update SVGs centrally
            const playSVG = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
            const pauseSVG = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;

            document.getElementById('miniPlayIcon').innerHTML = this.isPlaying ? pauseSVG : playSVG;
            document.getElementById('maxPlayIcon').innerHTML = this.isPlaying ? pauseSVG : playSVG;
        }

        updateProgress() {
            if (!this.audio.duration) return;
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressBar').value = progress;
            document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
            document.getElementById('durationTime').textContent = this.formatTime(this.audio.duration);
        }

        formatTime(seconds) {
            if (isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        toggleShuffle() {
            this.isShuffle = !this.isShuffle;
            const btn = document.getElementById('shuffleBtn');
            if (this.isShuffle) {
                btn.classList.add('active');
                this.generateShuffleQueue();
            } else {
                btn.classList.remove('active');
            }
        }

        generateShuffleQueue() {
            this.shuffledIndices = this.playlist.map((_, i) => i);
            for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
            }
            const currPos = this.shuffledIndices.indexOf(this.currentIndex);
            if (currPos > -1) {
                this.shuffledIndices.splice(currPos, 1);
                this.shuffledIndices.unshift(this.currentIndex);
            }
        }

        toggleLoop() {
            this.loopMode = (this.loopMode + 1) % 3; 
            const btn = document.getElementById('loopBtn');
            const loopAllSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`;
            const loopOneSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path><text x="10" y="15" font-size="9" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>`;

            if (this.loopMode === 0) {
                btn.classList.remove('active');
                btn.innerHTML = loopAllSvg;
            } else if (this.loopMode === 1) {
                btn.classList.add('active');
                btn.innerHTML = loopAllSvg;
            } else if (this.loopMode === 2) {
                btn.classList.add('active');
                btn.innerHTML = loopOneSvg;
            }
        }

        nextTrack() {
            if (!this.playlist.length) return;
            if (this.isShuffle && this.shuffledIndices.length) {
                let currentPos = this.shuffledIndices.indexOf(this.currentIndex);
                currentPos = (currentPos + 1) % this.shuffledIndices.length;
                this.currentIndex = this.shuffledIndices[currentPos];
            } else {
                this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
            }
            this.playTrack(this.playlist[this.currentIndex], this.playlist, this.currentIndex);
        }

        prevTrack() {
            if (!this.playlist.length) return;
            if (this.isShuffle && this.shuffledIndices.length) {
                let currentPos = this.shuffledIndices.indexOf(this.currentIndex);
                currentPos = (currentPos - 1 + this.shuffledIndices.length) % this.shuffledIndices.length;
                this.currentIndex = this.shuffledIndices[currentPos];
            } else {
                this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            }
            this.playTrack(this.playlist[this.currentIndex], this.playlist, this.currentIndex);
        }

        handleTrackEnded() {
            if (this.loopMode === 2) {
                this.audio.currentTime = 0;
                this.audio.play();
            } else if (this.currentIndex === this.playlist.length - 1 && this.loopMode === 0 && !this.isShuffle) {
                this.isPlaying = false;
                this.updateUIState();
            } else {
                this.nextTrack();
            }
        }

        saveState() {
            localStorage.setItem('oneCirclePlayerState', JSON.stringify({
                track: this.currentTrack, 
                isPlaying: this.isPlaying,
                currentTime: this.audio.currentTime, 
                playlist: this.playlist, 
                currentIndex: this.currentIndex
            }));
        }

        restoreState() {
            const saved = localStorage.getItem('oneCirclePlayerState');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    if (state.track) {
                        this.currentTrack = state.track;
                        this.playlist = state.playlist || [];
                        this.currentIndex = state.currentIndex || 0;
                        this.isPlaying = false; // Always load paused to satisfy browser policies
                        
                        this.audio.src = state.track.file || state.track.audioUrl || '';
                        this.audio.currentTime = state.currentTime || 0;
                        
                        document.getElementById('persistentPlayer').style.display = 'block';
                        this.updateUIState();
                        this.updateProgress();
                    }
                } catch(e) {
                    console.error("Error restoring player state:", e);
                }
            }
        }
    }

    window.globalPlayer = new GlobalPersistentPlayer();

    // Client-side SPA Router
    function initRouter() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || link.getAttribute('target') === '_blank') {
                return;
            }
            e.preventDefault();
            loadPage(href);
        });
        window.addEventListener('popstate', () => loadPage(window.location.pathname, false));
    }

    async function loadPage(url, pushState = true) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const html = await res.text();
            
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            document.title = newDoc.title;
            document.body.innerHTML = newDoc.body.innerHTML;
            document.body.appendChild(playerContainer);

            if (pushState) history.pushState({}, '', url);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            document.body.querySelectorAll('script').forEach(oldScript => {
                if (oldScript.src && oldScript.src.includes('player.js')) return;
                const newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                else newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            if (typeof window.initPage === 'function') {
                window.initPage();
            }
        } catch (err) {
            window.location.href = url;
        }
    }

    initRouter();
})();

