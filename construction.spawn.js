module.exports = {
    type: "spawn",
    outline: function(room, spawn) {
        let x = spawn.x,
            y = spawn.y;

        room.visual.circle(x, y, { stroke: "#77f", fill: null, radius: 0.5 });
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
    },
    plan: function(spaceFinder, buildings) {
        let requiredSpawns = 3 - _.filter(buildings, (b) => b.type === this.type).length;
        if(requiredSpawns <= 0) return [];
        let extensionClusters = _.filter(buildings, (b) => b.type === "extensionCluster");
        let plannedSpawns = [];

        for(let cluster of extensionClusters) {
            for(let dx of [0, 5]) {
                for(let dy of [0, 5]) {
                    let x = cluster.pos.x + dx;
                    let y = cluster.pos.y + dy;
                    if(spaceFinder.isFreeSpace(x, y)) {
                        plannedSpawns.push({ x: x, y: y });
                        requiredSpawns--;
                        if(requiredSpawns <= 0) return plannedSpawns;
                    }
                }
            }
        }

        return plannedSpawns;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.tower');
