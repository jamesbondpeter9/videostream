/**
 * storage.js - Centralized Storage and Database Helper for Video Portal
 */
const StorageDB = {
    STREAMS_KEY: 'video_portal_streams_db',
    MODELS_KEY: 'video_portal_models_db',

    async initDB() {
        try {
            const response = await fetch('videos.json?' + new Date().getTime());
            if (response.ok) {
                const data = await response.json();
                if (data.models) localStorage.setItem(this.MODELS_KEY, JSON.stringify(data.models));
                if (data.streams) localStorage.setItem(this.STREAMS_KEY, JSON.stringify(data.streams));
                return;
            }
        } catch (e) {
            console.error('Could not load videos.json from repository, checking localStorage fallback.', e);
        }

        if (!localStorage.getItem(this.MODELS_KEY)) localStorage.setItem(this.MODELS_KEY, JSON.stringify([]));
        if (!localStorage.getItem(this.STREAMS_KEY)) localStorage.setItem(this.STREAMS_KEY, JSON.stringify([]));
    },

    async syncToGitHub(commitMessage = "Auto-update video gallery database") {
        const owner = localStorage.getItem('ghOwner');
        const repo = localStorage.getItem('ghRepo');
        const token = localStorage.getItem('ghToken');

        if (!owner || !repo || !token) {
            console.warn("GitHub credentials (ghOwner, ghRepo, ghToken) not set in localStorage.");
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
            if (!getRes.ok) throw new Error("Failed to fetch video-gallery.html from GitHub repository.");
            const fileData = await getRes.json();

            let currentHtml = decodeURIComponent(escape(atob(fileData.content)));
            const updatedHtml = currentHtml.replace(
                /<script type="application\/json" id="embedded-database">[\s\S]*?<\/script>/,
                `<script type="application/json" id="embedded-database">\n    ${newJsonString}\n    </script>`
            );

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

            if (!putRes.ok) throw new Error("Failed to commit updated video-gallery.html to GitHub.");
            console.log("Successfully synced database updates to video-gallery.html on GitHub!");
        } catch (err) {
            console.error("GitHub API automatic sync failed:", err);
        }
    },

    getStreams() {
        try {
            const data = localStorage.getItem(this.STREAMS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveStreams(streams, triggerSync = true) {
        localStorage.setItem(this.STREAMS_KEY, JSON.stringify(streams, null, 4));
        if (triggerSync) this.syncToGitHub("Update streams database");
    },

    addStream(streamData) {
        const streams = this.getStreams();
        const newStream = {
            title: streamData.title || 'Untitled Stream',
            url: streamData.url || '',
            thumbnail: streamData.thumbnail || '',
            models: streamData.models || [],
            createdAt: Date.now()
        };
        streams.unshift(newStream);
        this.saveStreams(streams);
        return newStream;
    },

    removeStream(index) {
        const streams = this.getStreams();
        if (streams[index]) {
            streams.splice(index, 1);
            this.saveStreams(streams);
        }
    },

    getModels() {
        try {
            const data = localStorage.getItem(this.MODELS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveModels(models, triggerSync = true) {
        localStorage.setItem(this.MODELS_KEY, JSON.stringify(models, null, 4));
        if (triggerSync) this.syncToGitHub("Update models database");
    },

    addModel(name, thumbnail) {
        const models = this.getModels();
        const newModel = {
            name: name.trim(),
            thumbnail: thumbnail.trim(),
            createdAt: Date.now()
        };
        models.push(newModel);
        this.saveModels(models);
        return newModel;
    },

    removeModel(index) {
        const models = this.getModels();
        if (models[index]) {
            models.splice(index, 1);
            this.saveModels(models);
        }
    }
};
