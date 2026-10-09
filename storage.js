/**
 * storage.js - Centralized Storage and Database Helper for Video Portal
 */
const StorageDB = {
    STREAMS_KEY: 'video_portal_streams_db',
    MODELS_KEY: 'video_portal_models_db',

    async initDB() {
        if (!localStorage.getItem(this.MODELS_KEY)) localStorage.setItem(this.MODELS_KEY, JSON.stringify([]));
        if (!localStorage.getItem(this.STREAMS_KEY)) localStorage.setItem(this.STREAMS_KEY, JSON.stringify([]));

        try {
            const response = await fetch('videos.json?' + new Date().getTime());
            if (response.ok) {
                const data = await response.json();
                const localModels = JSON.parse(localStorage.getItem(this.MODELS_KEY) || '[]');
                if (data.models && data.models.length > 0 && localModels.length === 0) {
                    localStorage.setItem(this.MODELS_KEY, JSON.stringify(data.models));
                }
                const localStreams = JSON.parse(localStorage.getItem(this.STREAMS_KEY) || '[]');
                if (data.streams && data.streams.length > 0 && localStreams.length === 0) {
                    localStorage.setItem(this.STREAMS_KEY, JSON.stringify(data.streams));
                }
            }
        } catch (e) {
            console.log('Running on local storage cache.');
        }
    },

    async syncToGitHub(commitMessage = "Auto-update video gallery database") {
        const owner = localStorage.getItem('ghOwner');
        const repo = localStorage.getItem('ghRepo');
        const token = localStorage.getItem('ghToken');

        if (!owner || !repo || !token) {
            console.warn("GitHub credentials not configured in localStorage. Data saved locally.");
            return;
        }

        const fullData = {
            models: this.getModels(),
            streams: this.getStreams(),
            homepage_thumbnails: []
        };
        const newJsonString = JSON.stringify(fullData, null, 4);
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/video-gallery.html`;

        try {
            const getRes = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!getRes.ok) {
                console.warn("video-gallery.html not found on repo yet. Skipping remote API sync.");
                return;
            }
            const fileData = await getRes.json();

            let currentHtml = decodeURIComponent(escape(atob(fileData.content)));
            const updatedHtml = currentHtml.replace(
                /<script type="application\/json" id="embedded-database">[\s\S]*?<\/script>/,
                `<script type="application/json" id="embedded-database">\n    ${newJsonString}\n    </script>`
            );

            await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: btoa(unescape(encodeURIComponent(updatedHtml))),
                    sha: fileData.sha
                })
            });
            console.log("Successfully synced database updates to GitHub!");
        } catch (err) {
            console.error("GitHub API sync warning:", err);
        }
    },

    getStreams() {
        try { return JSON.parse(localStorage.getItem(this.STREAMS_KEY) || '[]'); } catch (e) { return []; }
    },
    saveStreams(streams, triggerSync = true) {
        localStorage.setItem(this.STREAMS_KEY, JSON.stringify(streams));
        if (triggerSync) this.syncToGitHub("Update streams database");
    },
    addStream(streamData) {
        const streams = this.getStreams();
        streams.unshift({
            title: streamData.title || 'Untitled Stream',
            url: streamData.url || '',
            thumbnail: streamData.thumbnail || '',
            models: streamData.models || [],
            createdAt: Date.now()
        });
        this.saveStreams(streams);
    },
    removeStream(index) {
        const streams = this.getStreams();
        if (streams[index]) { streams.splice(index, 1); this.saveStreams(streams); }
    },

    getModels() {
        try { return JSON.parse(localStorage.getItem(this.MODELS_KEY) || '[]'); } catch (e) { return []; }
    },
    saveModels(models, triggerSync = true) {
        localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
        if (triggerSync) this.syncToGitHub("Update models database");
    },
    addModel(name, thumbnail) {
        const models = this.getModels();
        models.push({ name: name.trim(), thumbnail: thumbnail.trim(), createdAt: Date.now() });
        this.saveModels(models);
    },
    removeModel(index) {
        const models = this.getModels();
        if (models[index]) { models.splice(index, 1); this.saveModels(models); }
    }
};
