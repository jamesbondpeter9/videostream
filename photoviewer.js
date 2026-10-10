window.PhotoViewer = (() => {
    let overlay = null;
    let currentItems = [];
    let currentIndex = 0;

    function createOverlay() {
        if (overlay) return;
        
        overlay = document.createElement('div');
        overlay.id = 'photoViewerOverlay';
        overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.96); z-index:9999; align-items:center; justify-content:center; flex-direction:column; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);';
        
        overlay.innerHTML = `
            <div style="position:absolute; top:20px; right:20px; display:flex; gap:12px; z-index:10000;">
                <button id="pvClose" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:8px 18px; border-radius:12px; cursor:pointer; font-weight:700; font-family:inherit; transition:all 0.2s ease;">Close</button>
            </div>
            <div style="position:absolute; left:20px; top:50%; transform:translateY(-50%); z-index:10000; cursor:pointer; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); padding:16px 20px; color:#fff; font-size:1.5rem; border-radius:50%; user-select:none; transition:all 0.2s ease;" id="pvPrev">&#10094;</div>
            <div style="position:absolute; right:20px; top:50%; transform:translateY(-50%); z-index:10000; cursor:pointer; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1); padding:16px 20px; color:#fff; font-size:1.5rem; border-radius:50%; user-select:none; transition:all 0.2s ease;" id="pvNext">&#10095;</div>
            <div style="max-width:90vw; max-height:80vh; display:flex; align-items:center; justify-content:center;" id="pvImgContainer">
                <img id="pvImage" src="" alt="" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:12px; box-shadow:0 10px 40px rgba(0,0,0,0.9); border:1px solid rgba(255,255,255,0.1);">
            </div>
            <div id="pvCaption" style="margin-top:16px; color:#fff; font-size:0.9rem; font-weight:700; text-align:center; font-family:inherit; letter-spacing:0.5px;"></div>
        `;

        document.body.appendChild(overlay);

        // Bind Control Events
        document.getElementById('pvClose').onclick = (e) => { e.stopPropagation(); close(); };
        document.getElementById('pvPrev').onclick = (e) => { e.stopPropagation(); navigate(-1); };
        document.getElementById('pvNext').onclick = (e) => { e.stopPropagation(); navigate(1); };

        // Close when clicking background outside active image
        overlay.onclick = (e) => {
            if (e.target === overlay || e.target.id === 'pvImgContainer') {
                close();
            }
        };

        // Keyboard Controls Listener
        document.addEventListener('keydown', (e) => {
            if (overlay && overlay.style.display === 'flex') {
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowLeft') navigate(-1);
                if (e.key === 'ArrowRight') navigate(1);
            }
        });
    }

    function open(items, index = 0) {
        if (!items || (Array.isArray(items) && items.length === 0)) return;
        createOverlay();
        currentItems = Array.isArray(items) ? items : [items];
        currentIndex = index >= 0 && index < currentItems.length ? index : 0;
        updateView();
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function close() {
        if (overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    function navigate(direction) {
        if (currentItems.length <= 1) return;
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
        
        // Extract URL and Title properly regardless of raw string or stream object format
        const imgSrc = typeof item === 'string' ? item : (item.url || item.thumbnail || '');
        const imgTitle = typeof item === 'object' ? (item.title || item.folder || 'Photo') : 'Photo';

        img.src = imgSrc;
        caption.textContent = `${imgTitle} (${currentIndex + 1} of ${currentItems.length})`;
    }

    return {
        open,
        close,
        next: () => navigate(1),
        prev: () => navigate(-1)
    };
})();
