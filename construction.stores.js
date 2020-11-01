const buildings = require("helper.buildings");
const logistic = require("helper.logistic");

const linkOutline = [
    { x: -0.4, y: 0 },
    { x: 0, y: -0.5 },
    { x: 0.4, y: 0 },
    { x: 0, y: 0.5 },
    { x: -0.4, y: 0 },
];

const containerOutline = [
    { x: -0.3, y: -0.4 },
    { x: 0.3, y: -0.4 },
    { x: 0.3, y: 0.4 },
    { x: -0.3, y: 0.4 },
    { x: -0.3, y: -0.4 },
];

function determineStoreType(room, linkAllowed) {
    linkAllowed = linkAllowed && room.storage && room.ai().links.storage();
    linkAllowed = linkAllowed && buildings.available(room, STRUCTURE_LINK) > 0;

    if(linkAllowed) {
        return STRUCTURE_LINK;
    } else {
        return STRUCTURE_CONTAINER;
    }
}

// calls callback for all free spaces around target
// aborts iteration when callback returns true.
// Will return true if iteration was aborted early.
function eachSpaceAround(target, spaceFinder, callback) {
    let pos = target.pos;
    for(let xDir = -1; xDir <= 1; xDir++) {
        for(let yDir = -1; yDir <= 1; yDir++) {
            let x = pos.x + xDir;
            let y = pos.y + yDir;
            if((xDir != 0 || yDir != 0) && spaceFinder.isFreeSpace(x, y)) {
                if(callback({ x: x, y: y })) {
                    return true;
                }
            }
        }
    }
}

function hasStore(target, stores) {
    return _.any(stores, (s) => target.pos.getRangeTo(target.room.getPositionAt(s.memory.x, s.memory.y)) <= 2);
}

module.exports = {
    type: "store",
    outline: function(room, store) {
        let x = store.x;
        let y = store.y;
        let color = "#77f";
        if(store.rcl && room.controller.level < store.rcl) color = "#ff7";

        if(store.link) {
            room.visual.poly(_.map(linkOutline, (p) => [x + p.x, y + p.y]), { stroke: color });
        } else {
            room.visual.poly(_.map(containerOutline, (p) => [x + p.x, y + p.y]), { stroke: color });
        }
    },
    build: function(proxy, store) {
        if(store.rcl && proxy.room.controller.level < store.rcl) return;

        proxy.planConstruction(store.x, store.y, determineStoreType(proxy.room, store.link));
    },
    updateCostMatrix: function(matrix, store) {
        let cost = store.link ? 255 : 10;

        matrix.set(store.x, store.y, cost);
    },
    addBuilding: function(memory, flag) {
        memory.push({ x: flag.pos.x, y: flag.pos.y, link: flag.color !== 1 });
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (p) => p.x == flag.pos.x && p.y == flag.pos.y);
        if(index >= 0) memory.splice(index, 1);
    },
    plan: function(spaceFinder, buildings, room) {
        let result = [];
        let stores = _.filter(buildings, (b) => b.type === this.type);

        if(!hasStore(room.controller, stores)) {
            eachSpaceAround(room.controller, spaceFinder, (pos) => result.push({ x: pos.x, y: pos.y, link: true}));
        }

        for(let source of room.find(FIND_SOURCES)) {
            if(hasStore(source, stores)) continue;

            eachSpaceAround(source, spaceFinder, (minerPos) => eachSpaceAround({ pos: minerPos, room: room }, spaceFinder, (pos) => result.push({ x: pos.x, y: pos.y, link: true})));
        }

        let mineral = room.find(FIND_MINERALS)[0];
        if(mineral && !hasStore(mineral, stores)) {
            eachSpaceAround(mineral, spaceFinder, (pos) => result.push({ x: pos.x, y: pos.y, rcl: 6}));
        }

        return result;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'stores');
