window.PhotoViewer = (() => {
    let overlay = null;
    let currentItems = [];
    let currentIndex = 0;

    function createOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.96); z-index:9999; align-items:center; justify-content:center; flex-direction:column;';
        
        overlay.innerHTML = `
            <div style="position:absolute; top:20px; right:20px; display:flex; gap:12px; z-index:10000;">
                <button id="pvClose" style="background:rgba(255,255,255,0.1); border:1px solid var(--card-border); color:#fff; padding:8px 16px; border-radius:12px; cursor:pointer; font-weight:700;">Close</button>
            </div>
            <div style="position:absolute; left:20px; top:50%; transform:translateY(-50%); z-index:10000; cursor:pointer; background:rgba(0,0,0,0.5); padding:16px; color:#fff; font-size:1.5rem; border-radius:50%;" id="pvPrev">&#10094;</div>
            <div style="position:absolute; right:20px; top:50%; transform:translateY(-50%); z-index:10000; cursor:pointer; background:rgba(0,0,0,0.5); padding:16px; color:#fff; font-size:1.5rem; border-radius:50%;" id="pvNext">&#10095;</div>
            <div style="max-width:90vw; max-height:80vh; display:flex; align-items:center; justify-content:center;">
                <img id="pvImage" src="" alt="" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
            </div>
            <div id="pvCaption" style="margin-top:16px; color:#fff; font-size:0.9rem; font-weight:700; text-align:center;"></div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('pvClose').onclick = close;
        document.getElementById('pvPrev').onclick = () => navigate(-1);
        document.getElementById('pvNext').onclick = () => navigate(1);

        document.addEventListener('keydown', (e) => {
            if (overlay.style.display === 'flex') {
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            }
        });
    }

    function open(items, index = 0) {
        createOverlay();
        currentItems = items;
        currentIndex = index;
        updateView();
        overlay.style.display = 'flex';
    }

    function close() {
        if (overlay) overlay.style.display = 'none';
    }

    function navigate(direction) {
        currentIndex += direction;
        if (currentIndex < 0) currentIndex = currentItems.length - 1;
        if (currentIndex >= currentItems.length) currentIndex = 0;
        updateView();
    }

    function updateView() {
        if (!currentItems.length) return;
        const item = currentItems[currentIndex];
        const img = document.getElementById('pvImage');
        const caption = document.getElementById('pvCaption');
        
        img.src = item.url;
        caption.textContent = `${item.title || 'Photo'} (${currentIndex + 1} of ${currentItems.length})`;
    }

    return { open, close };
})();
