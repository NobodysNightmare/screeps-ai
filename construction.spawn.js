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
        // TODO: properly rewrite towards scalable extensions, without overwriting them
        // current solution is just a hack to place spawns anywhere
        let requiredSpawns = 3 - _.filter(buildings, (b) => b.type === this.type).length;
        if(requiredSpawns <= 0) return [];
        let extensionClusters = _.filter(buildings, (b) => b.type === "scalableExtensions");
        let plannedSpawns = [];

        for(let cluster of extensionClusters) {
            for(let dx of [1, 2, 3]) {
                for(let dy of [2]) {
                    let x = cluster.pos.x + dx;
                    let y = cluster.pos.y + dy;

                    plannedSpawns.push({ x: x, y: y });
                    requiredSpawns--;
                    if(requiredSpawns <= 0) return plannedSpawns;
                }
            }
        }

        return plannedSpawns;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.tower');
