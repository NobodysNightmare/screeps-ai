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
    type: "extensionCluster",
    outline: function(room, cluster) {
        let x = cluster.x,
            y = cluster.y;

        room.visual.poly(_.map(this.roadParts.concat(this.roadParts[0]), (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, cluster) {
        let x = cluster.x,
            y = cluster.y;
        for(let pos of this.extensionParts) {
            proxy.planConstruction(x + pos.x, y + pos.y, STRUCTURE_EXTENSION);
        }

        for(let pos of this.roadParts) {
            proxy.planConstruction(x + pos.x, y + pos.y, STRUCTURE_ROAD);
        }
    },
    updateCostMatrix: function(matrix, cluster) {
        let x = cluster.x,
            y = cluster.y;

        for(let pos of this.extensionParts) {
            matrix.set(x + pos.x, y + pos.y, 255);
        }
    },
    addBuilding: function(memory, flag) {
        memory.push({ x: flag.pos.x, y: flag.pos.y });
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (p) => p.x == flag.pos.x && p.y == flag.pos.y);
        if(index >= 0) memory.splice(index, 1);
    },
    // TODO: planning those efficiently is pretty hard... maybe a smaller alternative would be better?
    // Idea: something that can be "scaled" into a given rectangle via parameters
    plan: function(spaceFinder, buildings) {
        let requiredClusters = 5 - _.filter(buildings, (b) => b.type === this.type).length;
        if(requiredClusters <= 0) return [];

        let plannedClusters = [];
        let spaces = spaceFinder.findSpaces(6, 6);
        // preferring spaces close to map center, TODO: is there any better fitness function?
        spaces = _.sortBy(spaces, (s) => (s.center.x - 25)**2 + (s.center.y - 25)**2);
        for(let space of spaces) {
            for(let delta = 0; delta + 6 <= space.width && delta + 6 <= space.height; delta += 3) {
                plannedClusters.push({ x: space.x + delta, y: space.y + delta });
                requiredClusters--;
                if(requiredClusters <= 0) return plannedClusters;
            }
        }

        return plannedClusters;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.extensionCluster');
