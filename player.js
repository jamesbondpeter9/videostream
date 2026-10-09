/**
 * player.js - Robust Embed Code & CDN Bypass Parser
 */
const VideoPlayer = {
    init(containerId, stream) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rawInput = (stream.url || '').trim();
        let embedHtml = '';

        const loadingOverlay = `
            <div id="playerLoader" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px); z-index: 10; transition: opacity 0.4s ease;">
                <div style="width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.15); border-top-color: #fff; border-radius: 50%; animation: playerSpin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;"></div>
                <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700; margin-top: 12px; letter-spacing: 0.5px;">INITIALIZING STREAM...</span>
            </div>
            <style>
                @keyframes playerSpin { to { transform: rotate(360deg); } }
            </style>`;

        const isHtmlEmbedCode = /<\/?[a-z][\s\S]*>/i.test(rawInput);

        if (isHtmlEmbedCode) {
            let modifiedEmbed = rawInput;
            if (modifiedEmbed.includes('<iframe')) {
                modifiedEmbed = modifiedEmbed.replace(/width=["'][^"']*["']/gi, 'width="100%"');
                modifiedEmbed = modifiedEmbed.replace(/height=["'][^"']*["']/gi, 'height="100%"');
                if (!modifiedEmbed.includes('allow=')) {
                    modifiedEmbed = modifiedEmbed.replace('<iframe', '<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen');
                }
            }

            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000; border-radius: 20px;">
                    ${loadingOverlay}
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 20px; overflow: hidden;" id="customEmbedWrapper">
                        ${modifiedEmbed}
                    </div>
                </div>`;
        } else {
            const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const ytMatch = rawInput.match(ytRegex);

            const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?)/;
            const vimeoMatch = rawInput.match(vimeoRegex);

            const isHls = rawInput.endsWith('.m3u8') || rawInput.includes('.m3u8?');
            const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawInput);

            if (ytMatch && ytMatch[1]) {
                const videoId = ytMatch[1];
                embedHtml = `
                    <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                        ${loadingOverlay}
                        <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
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
                        <video id="robustVideoElement" controls autoplay playsinline preload="auto" style="width: 100%; height: 100%; border-radius: 20px; object-fit: contain;"></video>
                    </div>`;
            } else {
                embedHtml = `
                    <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000;">
                        ${loadingOverlay}
                        <iframe src="${rawInput}" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                                onload="document.getElementById('playerLoader').style.opacity='0'; setTimeout(() => document.getElementById('playerLoader').style.display='none', 400);"
                                onerror="handleCdnBlock()"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen>
                        </iframe>
                        <div id="cdnBlockNotice" style="display:none; position:absolute; inset:0; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; background: rgba(0,0,0,0.95); z-index: 12;">
                            <p style="color: #fff; margin-bottom: 14px; font-weight: 700; font-size: 0.95rem;">This CDN restricts direct frame embedding.</p>
                            <a href="${rawInput}" target="_blank" class="btn-primary" style="text-decoration:none; font-size:0.85rem; padding:10px 20px;">Open Stream Directly ↗</a>
                        </div>
                    </div>`;
            }
        }

        container.innerHTML = embedHtml;

        if (isHtmlEmbedCode) {
            setTimeout(() => {
                const loader = document.getElementById('playerLoader');
                if (loader) {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 400);
                }
            }, 1200);
        }

        window.handleCdnBlock = function() {
            const loader = document.getElementById('playerLoader');
            if (loader) loader.style.display = 'none';
            const notice = document.getElementById('cdnBlockNotice');
            if (notice) notice.style.display = 'flex';
        };

        const isHlsUrl = rawInput.endsWith('.m3u8') || rawInput.includes('.m3u8?');
        const isDirectVideoUrl = /\.(mp4|webm|ogg)(\?.*)?$/i.test(rawInput);
        if (!isHtmlEmbedCode && (isHlsUrl || isDirectVideoUrl)) {
            const videoElem = document.getElementById('robustVideoElement');
            const loader = document.getElementById('playerLoader');

            if (videoElem) {
                videoElem.addEventListener('loadeddata', () => {
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => loader.style.display = 'none', 400);
                    }
                });

                if (isHlsUrl) {
                    if (videoElem.canPlayType('application/vnd.apple.mpegurl')) {
                        videoElem.src = rawInput;
                    } else {
                        const initHls = () => {
                            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                                const hls = new Hls({ maxBufferLength: 30, startLevel: -1 });
                                hls.loadSource(rawInput);
                                hls.attachMedia(videoElem);
                                hls.on(Hls.Events.MANIFEST_PARSED, () => videoElem.play().catch(() => { videoElem.muted = true; videoElem.play(); }));
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
                    videoElem.src = rawInput;
                }
            }
        }
    }
};
