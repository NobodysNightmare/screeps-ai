module.exports = {
    outline: function(room, spawn) {
        let x = spawn.x,
            y = tospawnwer.y;

        spawn.room.visual.circle(x, y, { stroke: "#77f", radius: 0.5 });
    },
    build: function(proxy, spawn) {
        proxy.planConstruction(spawn.x, spawn.y, STRUCTURE_SPAWN);
    },
    updateCostMatrix: function(matrix, spawn) {
        matrix.set(spawn.x, spawn.y, 255);
    },
    addBuilding: function(memory, flag) {
        let count = memory.push({ x: flag.pos.x, y: flag.pos.y });
        if(count > 3) memory.shift();
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (p) => p.x == flag.pos.x && p.y == flag.pos.y);
        if(index >= 0) memory.splice(index, 1);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.tower');
