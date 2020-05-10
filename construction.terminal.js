// where to put a terminal relative to the storage
const storageOffsets = [
    { x: -3, y: -3 },
    { x: -3, y: -2 },
    { x: -3, y: -1 },
    { x: -3, y: 0 },
    { x: -3, y: 1 },
    { x: -3, y: 2 },
    { x: -3, y: 3 },
    { x: -2, y: -3 },
    { x: -2, y: 3 },
    { x: -1, y: -3 },
    { x: -1, y: 3 },
    { x: 0, y: -3 },
    { x: 0, y: 3 },
    { x: 1, y: -3 },
    { x: 1, y: 3 },
    { x: 2, y: -3 },
    { x: 2, y: 3 },
    { x: 3, y: -3 },
    { x: 3, y: -2 },
    { x: 3, y: -1 },
    { x: 3, y: 0 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 }
];

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
    type: "terminal",
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
    },
    plan: function(spaceFinder, buildings) {
        if(_.filter(buildings, (b) => b.type === this.type).length > 0) return [];

        let storage = _.find(buildings, (b) => b.type === "storage");
        if(!storage) return;

        for(let deltaPos of storageOffsets) {
            let x = storage.pos.x + deltaPos.x;
            let y = storage.pos.y + deltaPos.y;

            if(spaceFinder.isFreeSpace(x, y)) {
                // TODO: choose candidates matching this condition, but then compare
                // them by pathing distance, to avoid terminal on other side of
                // a wall
                return [{ x: x, y: y }];
            }
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.terminal');
