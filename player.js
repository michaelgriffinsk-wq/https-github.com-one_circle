// player.js - Global Persistent Player & Seamless Page Transition Engine

(function() {
    // 1. Inject Player HTML and CSS into the current page automatically
    const playerContainer = document.createElement('div');
    playerContainer.id = 'globalAudioPlayerRoot';
    playerContainer.innerHTML = `
        <style>
          #persistentPlayer {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 99999;
            background: #121212;
            color: #fff;
            font-family: 'DM Sans', sans-serif;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
            user-select: none;
          }
          .player-minimized {
            height: 64px; margin: 8px 12px; border-radius: 8px; background: #1f1f1f;
            display: flex; align-items: center; justify-content: space-between; padding: 0 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          .player-minimized .track-info { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; margin-right: 16px; }
          .player-minimized img { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
          .player-minimized .text-wrap { min-width: 0; flex: 1; }
          .player-minimized h4 { font-size: 14px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
          .player-minimized p { font-size: 12px; color: #aaa; margin: 2px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .player-minimized .controls-mini { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
          .player-minimized button { background: none; border: none; color: #fff; cursor: pointer; padding: 4px; }
          
          .player-expanded {
            position: fixed; inset: 0; background: linear-gradient(180deg, #38220f 0%, #121212 40%, #0a0a0b 100%);
            z-index: 100000; display: flex; flex-direction: column; padding: 32px 24px; box-sizing: border-box; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
          }
          .player-expanded.active { opacity: 1; pointer-events: auto; }
          .expanded-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .expanded-header button { background: none; border: none; color: #fff; cursor: pointer; }
          .expanded-header span { font-size: 11px; letter-spacing: 0.2em; font-weight: 700; color: #ccc; text-transform: uppercase; }
          .expanded-artwork { width: 100%; aspect-ratio: 1; max-height: 380px; border-radius: 12px; overflow: hidden; margin: auto 0; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .expanded-artwork img { width: 100%; height: 100%; object-fit: cover; }
          .expanded-meta { margin: 24px 0 16px 0; display: flex; justify-content: space-between; align-items: center; }
          .expanded-meta div { min-width: 0; flex: 1; margin-right: 16px; }
          .expanded-meta h2 { font-size: 22px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .expanded-meta p { font-size: 14px; color: #aaa; margin: 4px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .progress-container { width: 100%; margin-bottom: 24px; }
          .progress-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; cursor: pointer; position: relative; }
          .progress-bar-fill { height: 100%; background: #fff; border-radius: 2px; width: 0%; position: relative; }
          .progress-times { display: flex; justify-content: space-between; font-size: 11px; color: #aaa; margin-top: 8px; }
          .expanded-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
          .expanded-controls button { background: none; border: none; color: #fff; cursor: pointer; }
          .play-pause-big { width: 64px; height: 64px; background: #fff !important; color: #000 !important; border-radius: 50%; display: grid; place-items: center; }
        </style>

        <div id="persistentPlayer" style="display: none;">
            <div class="player-minimized" id="minimizedBar">
                <div class="track-info" id="expandTrigger">
                    <img id="miniImg" src="" alt="Art">
                    <div class="text-wrap">
                        <h4 id="miniTitle"></h4>
                        <p id="miniArtist"></p>
                    </div>
                </div>
                <div class="controls-mini">
                    <button id="miniPlayBtn">
                        <svg id="miniPlayIcon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                </div>
            </div>

            <div class="player-expanded" id="expandedView">
                <div class="expanded-header">
                    <button id="collapseBtn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <span>Now Playing</span>
                    <div style="width: 24px;"></div>
                </div>

                <div class="expanded-artwork" id="swipeArea">
                    <img id="expandedImg" src="" alt="Art">
                </div>

                <div class="expanded-meta">
                    <div>
                        <h2 id="expandedTitle"></h2>
                        <p id="expandedArtist"></p>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar-bg" id="progressBarBg">
                        <div class="progress-bar-fill" id="progressBarFill"></div>
                    </div>
                    <div class="progress-times">
                        <span id="currentTime">0:00</span>
                        <span id="totalTime">0:00</span>
                    </div>
                </div>

                <div class="expanded-controls">
                    <button id="prevBtn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="play-pause-big" id="expandedPlayBtn">
                        <svg id="expandedPlayIcon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button id="nextBtn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(playerContainer);

    // 2. Player Logic Class
    class GlobalPersistentPlayer {
        constructor() {
            this.currentTrack = null;
            this.isPlaying = false;
            this.isExpanded = false;
            this.playlist = [];
            this.currentIndex = 0;
            
            this.audio = document.createElement('audio');
            document.body.appendChild(this.audio);

            this.initListeners();
            this.restoreState();
        }

        initListeners() {
            document.getElementById('expandTrigger').addEventListener('click', () => this.setExpanded(true));
            document.getElementById('collapseBtn').addEventListener('click', () => this.setExpanded(false));

            document.getElementById('miniPlayBtn').addEventListener('click', (e) => { e.stopPropagation(); this.togglePlay(); });
            document.getElementById('expandedPlayBtn').addEventListener('click', () => this.togglePlay());

            document.getElementById('prevBtn').addEventListener('click', () => this.prevTrack());
            document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());

            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.nextTrack());

            document.getElementById('progressBarBg').addEventListener('click', (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = pos * this.audio.duration;
            });

            // Swipe Gestures
            let touchStartY = 0, touchStartX = 0;
            const swipeArea = document.getElementById('swipeArea');

            swipeArea.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }, {passive: true});

            swipeArea.addEventListener('touchend', (e) => {
                const diffY = e.changedTouches[0].clientY - touchStartY;
                const diffX = e.changedTouches[0].clientX - touchStartX;

                if (diffY > 60 && Math.abs(diffX) < 50) this.setExpanded(false);
                else if (diffX < -60 && Math.abs(diffY) < 50) this.nextTrack();
                else if (diffX > 60 && Math.abs(diffY) < 50) this.prevTrack();
            }, {passive: true});
        }

        playTrack(track, playlist = [], index = 0) {
            this.currentTrack = track;
            this.playlist = playlist;
            this.currentIndex = index;

            this.audio.src = track.file || track.audioUrl || '';
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateUIState();
                document.getElementById('persistentPlayer').style.display = 'block';
                this.saveState();
            }).catch(err => console.error("Playback error:", err));
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

        nextTrack() {
            if (this.playlist.length > 0) {
                this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
                this.playTrack(this.playlist[this.currentIndex], this.playlist, this.currentIndex);
            }
        }

        prevTrack() {
            if (this.playlist.length > 0) {
                this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
                this.playTrack(this.playlist[this.currentIndex], this.playlist, this.currentIndex);
            }
        }

        setExpanded(expand) {
            this.isExpanded = expand;
            const view = document.getElementById('expandedView');
            if (expand) {
                view.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                view.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        updateUIState() {
            if (!this.currentTrack) return;

            const img = this.currentTrack.image || 'https://images.pexels.com/photos/7708458/pexels-photo-7708458.jpeg';
            const title = this.currentTrack.title || 'Unknown Track';
            const artist = this.currentTrack.artist || 'One Circle';

            document.getElementById('miniImg').src = img;
            document.getElementById('miniTitle').textContent = title;
            document.getElementById('miniArtist').textContent = artist;

            document.getElementById('expandedImg').src = img;
            document.getElementById('expandedTitle').textContent = title;
            document.getElementById('expandedArtist').textContent = artist;

            const playSVG = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
            const pauseSVG = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;

            document.getElementById('miniPlayIcon').innerHTML = this.isPlaying ? pauseSVG : playSVG;
            document.getElementById('expandedPlayIcon').innerHTML = this.isPlaying ? pauseSVG : playSVG;
        }

        updateProgress() {
            if (isNaN(this.audio.duration)) return;
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressBarFill').style.width = `${progressPercent}%`;
            document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
            document.getElementById('totalTime').textContent = this.formatTime(this.audio.duration);
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        saveState() {
            const state = {
                track: this.currentTrack,
                isPlaying: this.isPlaying,
                currentTime: this.audio.currentTime,
                playlist: this.playlist,
                currentIndex: this.currentIndex
            };
            localStorage.setItem('oneCirclePlayerState', JSON.stringify(state));
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
                        this.audio.src = state.track.file || state.track.audioUrl || '';
                        this.audio.currentTime = state.currentTime || 0;
                        
                        document.getElementById('persistentPlayer').style.display = 'block';
                        this.isPlaying = false;
                        this.updateUIState();
                    }
                } catch(e) { console.error("Could not restore player state", e); }
            }
        }
    }

    window.globalPlayer = new GlobalPersistentPlayer();

    // 3. Seamless SPA Page Transition Engine (Prevents audio interruption on navigation)
    function initRouter() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            // Check if it's an internal link (ignores external links, mailto, anchors, or target="_blank")
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || link.getAttribute('target') === '_blank') {
                return;
            }

            e.preventDefault();
            loadPage(href, true);
        });

        window.addEventListener('popstate', () => {
            loadPage(window.location.pathname, false);
        });
    }

    async function loadPage(url, pushState = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Page load failed');
            const htmlText = await response.text();

            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            // Swap out body content while keeping the audio engine container intact
            document.title = newDoc.title;
            document.body.innerHTML = newDoc.body.innerHTML;

            // Re-append the player root so it doesn't get wiped out by the swap
            document.body.appendChild(playerContainer);

            if (pushState) {
                history.pushState({}, '', url);
            }

            // Scroll back to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Re-execute any scripts found in the newly loaded body content
            const scripts = document.body.querySelectorAll('script');
            scripts.forEach(script => {
                // Skip player.js itself to avoid double-binding
                if (script.src && script.src.includes('player.js')) return;

                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.body.appendChild(newScript);
            });

        } catch (err) {
            console.error("Navigation error, falling back to standard link load:", err);
            window.location.href = url;
        }
    }

    // Initialize the router on load
    initRouter();
})();

