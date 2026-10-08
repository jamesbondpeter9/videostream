/**
 * player.js - Universal Video Player Embedder
 */
const VideoPlayer = {
    init(containerId, stream) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const url = stream.url || '';
        let embedHtml = '';

        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const ytMatch = url.match(ytRegex);

        if (ytMatch && ytMatch[1]) {
            const videoId = ytMatch[1];
            embedHtml = `
                <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 14px; overflow: hidden; border: 1px solid var(--card-border);">
                    <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        } else if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            embedHtml = `
                <div style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 14px; overflow: hidden; border: 1px solid var(--card-border);">
                    <video controls autoplay style="width: 100%; height: 100%; object-fit: contain;">
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>`;
        } else {
            embedHtml = `
                <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 14px; overflow: hidden; border: 1px solid var(--card-border);">
                    <iframe src="${url}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                            allowfullscreen>
                    </iframe>
                </div>`;
        }

        container.innerHTML = embedHtml;
    }
};
