module.exports = {
    outlineCorners: [
        { x: -0.5, y: 0 },
        { x: 0, y: -0.5 },
        { x: 0.5, y: 0 },
        { x: 0, y: 0.5 },
        { x: -0.5, y: 0 },
    ],
    outline: function(room, tower) {
        let x = tower.x,
            y = tower.y;

        room.visual.poly(_.map(this.outlineCorners, (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, tower) {
        proxy.planConstruction(tower.x, tower.y, STRUCTURE_TOWER);
    },
    updateCostMatrix: function(matrix, tower) {
        matrix.set(tower.x, tower.y, 255);
    },
    addBuilding: function(memory, flag) {
        memory.push({ x: flag.pos.x, y: flag.pos.y });
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (p) => p.x == flag.pos.x && p.y == flag.pos.y);
        if(index >= 0) memory.splice(index, 1);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.tower');
