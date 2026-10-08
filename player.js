/**
 * player.js - Robust Universal Video Player & Stream Embedder
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

        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden;">
                    <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else if (vimeoMatch && vimeoMatch[1]) {
            const vimeoId = vimeoMatch[1];
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden;">
                    <iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 20px;" 
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else if (isHls) {
            // HLS stream using native support or Hls.js library fallback
            embedHtml = `
                <div class="control-panel" style="position: relative; width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                    <video id="hlsVideoElement" controls autoplay style="width: 100%; height: 100%; border-radius: 20px; object-fit: contain;"></video>
                </div>`;
        } else if (isDirectVideo) {
            embedHtml = `
                <div class="control-panel" style="width: 100%; aspect-ratio: 16/9; padding: 0; overflow: hidden; background: #000;">
                    <video controls autoplay style="width: 100%; height: 100%; object-fit: contain; border-radius: 20px;">
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>`;
        } else {
            // Generic fallback iframe with open-in-new-tab link if blocked by X-Frame-Options
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

        // Initialize HLS.js if it's an HLS stream
        if (isHls) {
            const videoElem = document.getElementById('hlsVideoElement');
            if (videoElem) {
                if (videoElem.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari / iOS)
                    videoElem.src = url;
                } else {
                    // Load hls.js dynamically for browsers without native HLS support (Chrome, Firefox, Edge)
                    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(videoElem);
                    } else {
                        // Dynamically load hls.js script CDN if not present
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                        script.onload = () => {
                            if (Hls.isSupported()) {
                                const hls = new Hls();
                                hls.loadSource(url);
                                hls.attachMedia(videoElem);
                            } else {
                                videoElem.outerHTML = `<div style="padding:40px; text-align:center; color:#fff;">HLS playback is not supported in this browser. <a href="${url}" target="_blank" style="color:var(--gold-accent);">Download Stream</a></div>`;
                            }
                        };
                        document.head.appendChild(script);
                    }
                }
            }
        }
    }
};
