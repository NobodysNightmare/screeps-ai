const roadParts = [
    { x: -1, y: 0 },
    { x: 1,  y: 0 },
    { x: 0,  y: -1 },
    { x: -1, y: -2 },
    { x: 1,  y: -2 },
    { x: 0,  y: -3 }
];

const towerParts = [
    { x: 0,  y: -4 },
    { x: -1, y: -3 },
    { x: 1,  y: -3 },
    { x: 0,  y: -2 },
    { x: -1, y: -1 },
    { x: 1,  y: -1 },
];

const outline = [
    { x: -1.5, y: 0.5 },
    { x: -1.5, y: -3.5 },
    { x: 0,    y: -4.5 },
    { x: 1.5,  y: -3.5 },
    { x: 1.5,  y: 0.5 },
    { x: -1.5, y: 0.5 }
];

function rotatePositions(positions, direction) {
    if(direction === 2) { // right
        return _.map(positions, (p) => ({ x: -p.y, y: -p.x }));
    } else if(direction === 3) { // down
        return _.map(positions, (p) => ({ x: -p.x, y: -p.y }));
    } else if(direction === 4) { // left
        return _.map(positions, (p) => ({ x: p.y, y: p.x }));
    } else { // up (or invalid)
        return positions;
    }
}

module.exports = {
    outline: function(room, stack) {
        let x = stack.x,
            y = stack.y,
            direction = stack.dir;

        room.visual.poly(_.map(rotatePositions(outline, direction), (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, stack) {
        let x = stack.x,
            y = stack.y,
            direction = stack.dir;
        for(let pos of rotatePositions(towerParts, direction)) {
            proxy.planConstruction(x + pos.x, y + pos.y, STRUCTURE_TOWER);
        }

        for(let pos of rotatePositions(roadParts, direction)) {
            proxy.planConstruction(x + pos.x, y + pos.y, STRUCTURE_ROAD);
        }
    },
    updateCostMatrix: function(matrix, stack) {
        let x = stack.x,
            y = stack.y,
            direction = stack.dir;

        for(let pos of rotatePositions(towerParts, direction)) {
            matrix.set(x + pos.x, y + pos.y, 255);
        }
    },
    addBuilding: function(memory, flag) {
        let size = memory.push({ x: flag.pos.x, y: flag.pos.y, dir: flag.color });
        if(size > 1) memory.shift();
    },
    removeBuilding: function(memory, flag) {
        memory.pop();
    },
    plan: function() {
        // TODO: replace this stub
        return [];
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.extensionstack');
