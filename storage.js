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
            console.log('Running on local cache.');
        }
    },

    getStreams() {
        try { return JSON.parse(localStorage.getItem(this.STREAMS_KEY) || '[]'); } catch (e) { return []; }
    },
    saveStreams(streams) {
        localStorage.setItem(this.STREAMS_KEY, JSON.stringify(streams));
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

    getModels() {
        try { return JSON.parse(localStorage.getItem(this.MODELS_KEY) || '[]'); } catch (e) { return []; }
    },
    saveModels(models) {
        localStorage.setItem(this.MODELS_KEY, JSON.stringify(models));
    },
    addModel(name, thumbnail) {
        const models = this.getModels();
        const newModel = { name: name.trim(), thumbnail: thumbnail.trim(), createdAt: Date.now() };
        models.push(newModel);
        this.saveModels(models);
        return newModel;
    }
};
