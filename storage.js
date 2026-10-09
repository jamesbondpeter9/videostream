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
            alert("GitHub Sync Error: Credentials not found! Please go to your 'Gallery Hub' (video-gallery.html) and save your GitHub Username, Repository Name, and Personal Access Token.");
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
            // 1. Fetch current file to get its SHA
            const getRes = await fetch(apiUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!getRes.ok) {
                throw new Error(`GitHub API Error (${getRes.status}): Could not find 'video-gallery.html' in repository '${owner}/${repo}'. Make sure video-gallery.html is committed to your main branch!`);
            }
            
            const fileData = await getRes.json();
            let currentHtml = decodeURIComponent(escape(atob(fileData.content)));
            
            const updatedHtml = currentHtml.replace(
                /<script type="application\/json" id="embedded-database">[\s\S]*?<\/script>/,
                `<script type="application/json" id="embedded-database">\n    ${newJsonString}\n    </script>`
            );

            // 2. Push updated file to GitHub
            const putRes = await fetch(apiUrl, {
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

            if (!putRes.ok) {
                const errJson = await putRes.json();
                throw new Error(`GitHub Commit Failed (${putRes.status}): ${errJson.message || 'Check your Personal Access Token scopes.'}`);
            }

            console.log("Successfully synced database updates to GitHub!");
        } catch (err) {
            console.error("GitHub API sync error:", err);
            alert("Automation Sync Failed:\n" + err.message);
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
