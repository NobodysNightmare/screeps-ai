module.exports = {
    directions: {
        1: { x: 0, y: -1 },
        2: { x: 1, y: 0 },
        3: { x: 0, y: 1 },
        4: { x: -1, y: 0 },
    },
    outlineCorners: [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
    ],
    outline: function(room, storage) {
        let x = storage.x,
            y = storage.y;
        let corners = [];
        for(let i = 0; i < this.outlineCorners.length; i++) {
            if(i == storage.dir) corners.push(this.directions[storage.dir]);
            corners.push(this.outlineCorners[i]);
        }

        room.visual.poly(_.map(corners, (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(room, storage) {
        let dir = this.directions[storage.dir];
        room.createConstructionSite(storage.x, storage.y, STRUCTURE_STORAGE);
        room.createConstructionSite(storage.x + dir.x, storage.y + dir.y, STRUCTURE_LINK);
    },
    addBuilding: function(memory, flag) {
        let size = memory.push({ x: flag.pos.x, y: flag.pos.y, dir: flag.color });
        if(size > 1) memory.shift();
    },
    removeBuilding: function(memory, flag) {
        memory.pop();
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.storage');