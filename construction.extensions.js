module.exports = {
    roadParts: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
        { x: 4, y: 4 },
        { x: 3, y: 5 },
        { x: 2, y: 5 },
        { x: 1, y: 4 },
        { x: 0, y: 3 },
        { x: 0, y: 2 },
        { x: 1, y: 1 },
    ],
    extensionParts: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
    ],
    outlineExtensionCluster: function(room, x, y) {
        room.visual.poly(_.map(this.roadParts.concat(this.roadParts[0]), (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    buildExtensionCluster: function(room, x, y) {
        for(let pos of this.extensionParts) {
            let result = room.createConstructionSite(x + pos.x, y + pos.y, STRUCTURE_EXTENSION);
            if(result == ERR_RCL_NOT_ENOUGH) return;
        }
        
        for(let pos of this.roadParts) {
            room.createConstructionSite(x + pos.x, y + pos.y, STRUCTURE_ROAD);
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'extensions');