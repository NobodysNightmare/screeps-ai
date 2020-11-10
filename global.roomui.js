const uiCache = {
    getOrAdd: function(roomName) {
        this.ensureMap();
        let result = this.uis[roomName];
        if(!result) {
            this.uis[roomName] = result = new RoomUI(roomName);
        }

        return result;
    },

    all: function() {
        this.ensureMap();
        return Object.values(this.uis);
    },

    ensureMap: function() {
        if(!this.uis || Game.time !== this.currentTick) {
            this.uis = {};
            this.currentTick = Game.time;
        }
    }
}

module.exports = class RoomUI {
    static forRoom(room) {
        return uiCache.getOrAdd(room.name || room);
    }

    static get all() {
        return uiCache.all();
    }

    constructor(roomName) {
        this.visual = new RoomVisual(roomName);
        this.captions = [];
    }

    addRoomCaption(caption, options) {
        this.captions.push({ text: caption, options: options });
    }

    render() {
        for(let row = 0; row < this.captions.length; row++) {
            this.visual.text(this.captions[row].text, 0, row, { align: "left", color: "#fff", stroke: "#000", ...this.captions[row].options });
        }
    }
}
