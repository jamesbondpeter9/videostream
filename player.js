/**
 * player.js - Performance-Optimized Universal Video Player & Stream Embedder
 */
const VideoPlayer = {
    init(containerId, stream) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const url = (stream.url || '').trim();
        let embedHtml = '';

        // 1. YouTube Regex Check
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const ytMatch = url.match(ytRegex);

        // 2. Vimeo Regex Check
        const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?)/;
        const vimeoMatch = url.match(vimeoRegex);

        // 3. HLS Stream Check (.m3u8)
        const isHls = url.endsWith('.m3u8') || url.includes('.m3u8?');

        // 4. Direct Video File Check (.mp4, .webm, .ogg)
        const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

        // Common loading overlay styling for smooth transition feedback
        const loadingOverlay = `
            <div id="playerLoader" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); z-index: 10; transition: opacity 0.4s ease;">
                <div style="width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.15); border-top-color: #fff; border-radius: 50%; animation: playerSpin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;"></div>
                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; margin-top: 12px; letter-spacing: 0.5px;">BUFFERING STREAM...</span>
            </div>
            <style>
                @keyframes playerSpin { to { transform: rotate(360deg); } }
            </style>`;

        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                    ${loadingOverlay}
                    <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                            onload="document.getElementById('playerLoader').style.opacity='0'; setTimeout(() => document.getElementById('playerLoader').style.display='none', 400);"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else if (vimeoMatch && vimeoMatch[1]) {
            const vimeoId = vimeoMatch[1];
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                    ${loadingOverlay}
                    <iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                            onload="document.getElementById('playerLoader').style.opacity='0'; setTimeout(() => document.getElementById('playerLoader').style.display='none', 400);"
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else if (isHls || isDirectVideo) {
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                    ${loadingOverlay}
                    <video id="smoothVideoElement" 
                           controls 
                           autoplay 
                           playsinline 
                           webkit-playsinline
                           preload="auto"
                           style="width: 100%; height: 100%; border-radius: 20px; object-fit: contain;">
                    </video>
                </div>`;
        } else {
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.85);">
                    <iframe src="${url}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                            onerror="this.style.display='none'; document.getElementById('fallbackNotice').style.display='flex';"
                            allowfullscreen>
                    </iframe>
                    <div id="fallbackNotice" style="display:none; position:absolute; inset:0; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; background: rgba(0,0,0,0.9);">
                        <p style="color: #fff; margin-bottom: 14px; font-weight: 700; font-size: 0.95rem;">This stream source restricts direct embedding.</p>
                        <a href="${url}" target="_blank" class="btn-primary" style="text-decoration:none; font-size:0.85rem; padding:10px 20px;">Open Stream in New Tab ↗</a>
                    </div>
                </div>`;
        }

        container.innerHTML = embedHtml;

        // Initialize Smooth HLS or Direct Video Buffering Management
        if (isHls || isDirectVideo) {
            const videoElem = document.getElementById('smoothVideoElement');
            const loader = document.getElementById('playerLoader');

            if (videoElem) {
                // Hide loader as soon as enough data is buffered for smooth playback
                videoElem.addEventListener('loadeddata', () => {
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.style.display = 'none', 400);
                    }
                });

                // Show loader if stalling/buffering mid-stream
                videoElem.addEventListener('waiting', () => {
                    if (loader) {
                        loader.style.display = 'flex';
                        loader.style.opacity = '1';
                    }
                });

                videoElem.addEventListener('playing', () => {
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.style.display = 'none', 400);
                    }
                });

                if (isHls) {
                    if (videoElem.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native Safari / iOS HLS smooth streaming
                        videoElem.src = url;
                    } else {
                        // Optimized Hls.js configuration for instant buffering & smooth recovery
                        const initHls = () => {
                            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                                const hlsConfig = {
                                    maxBufferLength: 30,          // Buffer up to 30 seconds ahead for smooth playback
                                    maxMaxBufferLength: 60,
                                    liveSyncDurationCount: 3,     // Low latency sync for live streams
                                    highBufferWatchdogPeriod: 1,
                                    nudgeOffset: 0.1,
                                    nudgeMaxRetry: 10,
                                    fragLoadingTimeOut: 20000,
                                    manifestLoadingTimeOut: 20000,
                                    startLevel: -1                // Auto-detect optimal starting quality
                                };

                                const hls = new Hls(hlsConfig);
                                hls.loadSource(url);
                                hls.attachMedia(videoElem);

                                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                                    videoElem.play().catch(() => {
                                        // Autoplay policy fallback (mute if browser blocks unmuted autoplay)
                                        videoElem.muted = true;
                                        videoElem.play();
                                    });
                                });

                                // Auto-recovery for dropped network fragments or stalling
                                hls.on(Hls.Events.ERROR, (event, data) => {
                                    if (data.fatal) {
                                        switch (data.type) {
                                            case Hls.ErrorTypes.NETWORK_ERROR:
                                                console.warn('HLS Network error encountered, attempting recovery...');
                                                hls.startLoad();
                                                break;
                                            case Hls.ErrorTypes.MEDIA_ERROR:
                                                console.warn('HLS Media error encountered, attempting recovery...');
                                                hls.recoverMediaError();
                                                break;
                                            default:
                                                console.error('Fatal HLS error, resetting stream.');
                                                hls.destroy();
                                                break;
                                        }
                                    }
                                });
                            } else {
                                if (loader) loader.innerHTML = `<span style="color:#fff; font-size:0.85rem; padding:20px; text-align:center;">HLS playback not supported in this browser. <a href="${url}" target="_blank" style="color:#fff; text-decoration:underline;">Direct Link</a></span>`;
                            }
                        };

                        if (typeof Hls !== 'undefined') {
                            initHls();
                        } else {
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                            script.onload = initHls;
                            document.head.appendChild(script);
                        }
                    }
                } else {
                    videoElem.src = url;
                }
            }
        }
    }
};
