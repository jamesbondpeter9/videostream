/**
 * PhotoViewer.js - Lightbox & Gallery Carousel Viewer
 * Features: Lightbox view, backdrop blur overlay, backdrop dismissal, and carousel navigation.
 */

class PhotoViewer {
    static init() {
        if (document.getElementById('photoViewerModal')) return;

        const modalHTML = `
            <div id="photoViewerModal" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); align-items:center; justify-content:center; padding:20px;">
                <button id="pvClose" style="position:absolute; top:20px; right:25px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:44px; height:44px; border-radius:50%; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10000; transition:background 0.2s;">&times;</button>
                
                <button id="pvPrev" style="position:absolute; left:20px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10000; transition:background 0.2s;">&#10094;</button>
                <button id="pvNext" style="position:absolute; right:20px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:50px; height:50px; border-radius:50%; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10000; transition:background 0.2s;">&#10095;</button>

                <div style="max-width:90vw; max-height:90vh; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative;">
                    <img id="pvImage" src="" alt="Expanded View" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:12px; box-shadow:0 25px 50px rgba(0,0,0,0.9);">
                    <div id="pvCaption" style="color:#fff; margin-top:14px; font-family:'Plus Jakarta Sans',sans-serif; font-weight:700; font-size:0.95rem; text-align:center; text-shadow:0 2px 4px rgba(0,0,0,0.8);"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event bindings
        const modal = document.getElementById('photoViewerModal');
        const closeBtn = document.getElementById('pvClose');
        const prevBtn = document.getElementById('pvPrev');
        const nextBtn = document.getElementById('pvNext');

        closeBtn.onclick = () => PhotoViewer.close();
        
        // Backdrop dismissal: click outside image container
        modal.onclick = (e) => {
            if (e.target === modal) {
                PhotoViewer.close();
            }
        };

        prevBtn.onclick = (e) => {
            e.stopPropagation();
            PhotoViewer.prev();
        };

        nextBtn.onclick = (e) => {
            e.stopPropagation();
            PhotoViewer.next();
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'flex') {
                if (e.key === 'Escape') PhotoViewer.close();
                if (e.key === 'ArrowLeft') PhotoViewer.prev();
                if (e.key === 'ArrowRight') PhotoViewer.next();
            }
        });
    }

    static galleryItems = [];
    static currentIndex = 0;

    static open(items, startIndex = 0) {
        PhotoViewer.init();
        PhotoViewer.galleryItems = items; // Expects array of objects: [{src: '...', title: '...'}]
        PhotoViewer.currentIndex = startIndex;
        PhotoViewer.updateView();
        document.getElementById('photoViewerModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    static close() {
        const modal = document.getElementById('photoViewerModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    static prev() {
        if (PhotoViewer.galleryItems.length === 0) return;
        PhotoViewer.currentIndex = (PhotoViewer.currentIndex - 1 + PhotoViewer.galleryItems.length) % PhotoViewer.galleryItems.length;
        PhotoViewer.updateView();
    }

    static next() {
        if (PhotoViewer.galleryItems.length === 0) return;
        PhotoViewer.currentIndex = (PhotoViewer.currentIndex + 1) % PhotoViewer.galleryItems.length;
        PhotoViewer.updateView();
    }

    static updateView() {
        const item = PhotoViewer.galleryItems[PhotoViewer.currentIndex];
        if (!item) return;
        const imgEl = document.getElementById('pvImage');
        const captionEl = document.getElementById('pvCaption');
        const prevBtn = document.getElementById('pvPrev');
        const nextBtn = document.getElementById('pvNext');

        imgEl.src = item.src;
        captionEl.textContent = item.title || '';

        // Hide navigation arrows if only 1 item exists
        if (PhotoViewer.galleryItems.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}
