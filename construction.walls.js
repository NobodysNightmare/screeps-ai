module.exports = {
    outline: function(room, walls) {
        room.visual.poly([
            { x: walls.x1, y: walls.y1 },
            { x: walls.x2, y: walls.y1 },
            { x: walls.x2, y: walls.y2 },
            { x: walls.x1, y: walls.y2 },
            { x: walls.x1, y: walls.y1 }
        ], { stroke: "#f77", strokeWidth: 0.03 });
    },
    build: function(room, walls) {
        // not yet building anything, just marking working area for masons
    },
    addBuilding: function(memory, flag) {
        if(memory.length == 0) memory.push({ x1: flag.pos.x, x2: flag.pos.x, y1: flag.pos.y, y2: flag.pos.y });
        let walls = memory[0];
        if(flag.color % 2 == 1) {
            walls.x1 = flag.pos.x;
            walls.y1 = flag.pos.y;
        } else {
            walls.x2 = flag.pos.x;
            walls.y2 = flag.pos.y;
        }
    },
    removeBuilding: function(memory, flag) {
        memory.pop();
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.walls');
