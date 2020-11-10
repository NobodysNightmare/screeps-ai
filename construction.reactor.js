const layout = require("helper.layout");

const directions = {
    1: { x: -1, y: -1 },
    2: { x: 1, y: -1 },
    3: { x: 1, y: 1 },
    4: { x: -1, y: 1 },
};
const outlineCorners = [
    { x: -1.5, y: -0.5 },
    { x: -1.5, y: -1.5 },
    { x: -0.5, y: -1.5 },
    { x: 0.5, y: -1.5 },
    { x: 1.5, y: -1.5 },
    { x: 1.5, y: -0.5 },
    { x: 1.5, y: 0.5 },
    { x: 1.5, y: 1.5 },
    { x: 0.5, y: 1.5 },
    { x: -0.5, y: 1.5 },
    { x: -1.5, y: 1.5 },
    { x: -1.5, y: 0.5 },
    { x: -1.5, y: -0.5 }
];
const directionsMap = {
    [TOP_LEFT]: 1,
    [TOP_RIGHT]: 2,
    [BOTTOM_RIGHT]: 3,
    [BOTTOM_LEFT]: 4
};

module.exports = {
    type: "reactor",
    outline: function(room, reactor) {
        let x = reactor.x,
            y = reactor.y;
        let corners = [];
        for(let i = 0; i < outlineCorners.length; i++) {
            if(i % 3 !== 1 || Math.floor(i/3) !== reactor.dir - 1) corners.push(outlineCorners[i]);
        }

        room.visual.poly(_.map(corners, (p) => [x + p.x, y + p.y]), { stroke: "#77f" });
    },
    build: function(proxy, reactor, roomai) {
        let dir = directions[reactor.dir];
        proxy.planConstruction(reactor.x + dir.x, reactor.y, STRUCTURE_LAB);
        proxy.planConstruction(reactor.x, reactor.y + dir.y, STRUCTURE_LAB);

        for(let x = -1; x <= 1; x += 1) {
            for(let y = -1; y <= 1; y += 1) {
                if(x == 0 && (y == 0 || y == dir.y)) continue;
                if(y == 0 && (x == 0 || x == dir.x)) continue;
                if(x == dir.x && y == dir.y) {
                    proxy.planConstruction(reactor.x + x, reactor.y + y, STRUCTURE_ROAD);
                } else {
                    proxy.planConstruction(reactor.x + x, reactor.y + y, STRUCTURE_LAB);
                }
            }
        }

        proxy.planConstruction(reactor.x, reactor.y, STRUCTURE_ROAD);
        roomai.labs.updateReactor(reactor, dir);
    },
    updateCostMatrix: function(matrix, reactor) {
        let dir = directions[reactor.dir];
        for(let x = -1; x <= 1; x += 1) {
            for(let y = -1; y <= 1; y += 1) {
                if(x == dir.x && y == dir.y) continue;
                if(x == 0 && y == 0) continue;

                matrix.set(reactor.x + x, reactor.y + y, 255);
            }
        }
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

        let storage = _.filter(buildings, (b) => b.type === "storage")[0];
        if(!storage) return [];

        let storagePos = storage.memory;
        let space = _.sortBy(spaces, (s) => layout.distanceFromSpace(storagePos, s))[0];
        let pos = layout.alignInSpace(storagePos, space, { x: 1, y: 1, width: 3, height: 3 });

        // figuring out direction of exit by plotting a course from reactor center to storage
        // making sure that the starting direction goes diagonally
        let pathStart = room.getPositionAt(pos.x, pos.y).findPathTo(room.getPositionAt(storagePos.x, storagePos.y), { ignoreCreeps: true, costCallback: function(roomName, matrix) {
            matrix.set(pos.x + 1, pos.y, 255);
            matrix.set(pos.x - 1, pos.y, 255);
            matrix.set(pos.x, pos.y + 1, 255);
            matrix.set(pos.x, pos.y - 1, 255);
        } })[0];
        let direction = pathStart ? directionsMap[pathStart.direction] : 1;

        return [{ x: pos.x, y: pos.y, dir: direction }];
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.reactor');
