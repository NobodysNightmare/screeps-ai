const layout = require("helper.layout");

module.exports = {
    directions: {
        1: { x: 0, y: -1 },
        2: { x: 1, y: 0 },
        3: { x: 0, y: 1 },
        4: { x: -1, y: 0 },
    },
    outlineCorners: [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
    ],
    type: "storage",
    outline: function(room, storage) {
        let x = storage.x,
            y = storage.y;
        let corners = [];
        for(let i = 0; i < this.outlineCorners.length; i++) {
            if(i == storage.dir) corners.push(this.directions[storage.dir]);
            corners.push(this.outlineCorners[i]);
        }

        room.visual.poly(_.map(corners, (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, storage) {
        let dir = this.directions[storage.dir];
        proxy.planConstruction(storage.x, storage.y, STRUCTURE_STORAGE);
        proxy.planConstruction(storage.x + dir.x, storage.y + dir.y, STRUCTURE_LINK);
        for(let x = -1; x <= 1; x += 1) {
            for(let y = -1; y <= 1; y += 1) {
                if(x === 0 && y === 0) continue;
                if(x === dir.x && y === dir.y) continue;
                proxy.planConstruction(storage.x + x, storage.y + y, STRUCTURE_ROAD);
            }
        }
    },
    updateCostMatrix: function(matrix, storage) {
        let dir = this.directions[storage.dir];
        matrix.set(storage.x, storage.y, 255);
        matrix.set(storage.x + dir.x, storage.y + dir.y, 255);
    },
    addBuilding: function(memory, flag) {
        let size = memory.push({ x: flag.pos.x, y: flag.pos.y, dir: flag.color });
        if(size > 1) memory.shift();
    },
    removeBuilding: function(memory, flag) {
        memory.pop();
    },
    plan: function(spaceFinder, buildings, room) {
        if(_.filter(buildings, (b) => b.type === this.type).length > 0) return [];

        let spaces = spaceFinder.findSpaces(3, 3);
        if(spaces.length === 0) return [];
        let sourcesPos = layout.averagePos(_.map(room.find(FIND_SOURCES), (s) => s.pos));
        let extensions = _.filter(buildings, (b) => b.type === "scalableExtensions");
        let extensionsPos = layout.averagePos(_.map(extensions, (e) => layout.centerPos(e.memory)));

        let preferredPos = layout.averagePos([sourcesPos, extensionsPos]);

        let space = _.sortBy(spaces, (s) => layout.distanceFromSpace(preferredPos, s))[0];
        let pos = layout.alignInSpace(preferredPos, space, { x: 1, y: 1, width: 3, height: 3 });
        return [{ x: pos.x, y: pos.y, dir: 1 }];
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.storage');
