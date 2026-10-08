/**
 * storage.js - Centralized Storage and Database Helper for Video Portal
 */
const StorageDB = {
    STREAMS_KEY: 'video_portal_streams_db',
    MODELS_KEY: 'video_portal_models_db',

    async initDB() {
        if (!localStorage.getItem(this.MODELS_KEY) || !localStorage.getItem(this.STREAMS_KEY)) {
            try {
                const response = await fetch('videos.json');
                const data = await response.json();
                
                if (data.models) localStorage.setItem(this.MODELS_KEY, JSON.stringify(data.models));
                if (data.streams) localStorage.setItem(this.STREAMS_KEY, JSON.stringify(data.streams));
            } catch (e) {
                console.error('Could not load videos.json, initializing empty storage.', e);
                if (!localStorage.getItem(this.MODELS_KEY)) localStorage.setItem(this.MODELS_KEY, JSON.stringify([]));
                if (!localStorage.getItem(this.STREAMS_KEY)) localStorage.setItem(this.STREAMS_KEY, JSON.stringify([]));
            }
        }
    },

    exportToJsonFile() {
        const fullData = {
            models: this.getModels(),
            streams: this.getStreams(),
            homepage_thumbnails: []
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 4));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "videos.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    getStreams() {
        try {
            const data = localStorage.getItem(this.STREAMS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveStreams(streams, triggerExport = true) {
        localStorage.setItem(this.STREAMS_KEY, JSON.stringify(streams, null, 4));
        if (triggerExport) this.exportToJsonFile();
    },

    addStream(streamData) {
        const streams = this.getStreams();
        const newStream = {
            title: streamData.title || 'Untitled Stream',
            url: streamData.url || '',
            thumbnail: streamData.thumbnail || '',
            models: streamData.models || [], // Supports model name tags array
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

    saveModels(models, triggerExport = true) {
        localStorage.setItem(this.MODELS_KEY, JSON.stringify(models, null, 4));
        if (triggerExport) this.exportToJsonFile();
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
