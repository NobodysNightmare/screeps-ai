module.exports = {
    outlineCorners: [
        { x: -0.25, y: -0.5 },
        { x: 0.25, y: -0.5 },
        { x: 0.5, y: -0.25 },
        { x: 0.5, y: 0.25 },
        { x: 0.25, y: 0.5 },
        { x: -0.25, y: 0.5 },
        { x: -0.5, y: 0.25 },
        { x: -0.5, y: -0.25 },
        { x: -0.25, y: -0.5 }
    ],
    outline: function(room, terminal) {
        let x = terminal.x,
            y = terminal.y;

        room.visual.poly(_.map(this.outlineCorners, (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, terminal) {
        proxy.planConstruction(terminal.x, terminal.y, STRUCTURE_TERMINAL);
    },
    updateCostMatrix: function(matrix, terminal) {
        matrix.set(terminal.x, terminal.y, 255);
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
profiler.registerObject(module.exports, 'construction.terminal');
