module.exports = {
    outline: function(room, booster) {
        let x = booster.x,
            y = booster.y;

        room.visual.circle(x, y, { stroke: "#77f", radius: 0.5, fill: null });
    },
    build: function(proxy, booster, roomai) {
        proxy.planConstruction(booster.x, booster.y, STRUCTURE_LAB);
        let lab = _.find(roomai.labs.all, (l) => l.pos.x === booster.x && l.pos.y === booster.y);
        if(lab) roomai.labs.setBooster(lab);
    },
    updateCostMatrix: function(matrix, booster) {
        matrix.set(booster.x, booster.y, 255);
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
profiler.registerObject(module.exports, 'construction.booster');
