const edgeMappings = {
    [TOP]:    { parallel: "x", orthogonal: "y", orthogonalPos: 2,  orthogonalSide: 1 },
    [BOTTOM]: { parallel: "x", orthogonal: "y", orthogonalPos: 47, orthogonalSide: 48 },
    [LEFT]:   { parallel: "y", orthogonal: "x", orthogonalPos: 2,  orthogonalSide: 1 },
    [RIGHT]:  { parallel: "y", orthogonal: "x", orthogonalPos: 47, orthogonalSide: 48 }
}

function eachWallPosition(exit, callback) {
    let edge = edgeMappings[exit.edge];
    for(let parallelPos = exit.start - 2; parallelPos <= exit.end + 2; parallelPos++) {
        callback({ [edge.parallel]: parallelPos, [edge.orthogonal]: edge.orthogonalPos });
    }

    callback({ [edge.parallel]: exit.start - 2, [edge.orthogonal]: edge.orthogonalSide });
    callback({ [edge.parallel]: exit.end + 2, [edge.orthogonal]: edge.orthogonalSide });
}

function posToEdge(position) {
    if(position.x === 0) return LEFT;
    if(position.y === 0) return TOP;
    if(position.x === 49) return RIGHT;
    if(position.y === 49) return BOTTOM;
}

function extendExit(exit, position) {
    let edge = posToEdge(position);
    if(exit.edge !== edge) return false;

    let edgeInfo = edgeMappings[edge];
    if(position[edgeInfo.parallel] === exit.start - 1) {
        exit.start -= 1;
        return true;
    }

    if(position[edgeInfo.parallel] === exit.end + 1) {
        exit.end += 1;
        return true;
    }

    return false;
}

module.exports = {
    type: "exitWalls",
    outline: function(room, exit) {
        let edge = edgeMappings[exit.edge];
        let positions = [
            { [edge.orthogonal]: edge.orthogonalSide, [edge.parallel]: exit.start - 2 },
            { [edge.orthogonal]: edge.orthogonalPos,  [edge.parallel]: exit.start - 2 },
            { [edge.orthogonal]: edge.orthogonalPos,  [edge.parallel]: exit.end + 2 },
            { [edge.orthogonal]: edge.orthogonalSide, [edge.parallel]: exit.end + 2 }
        ];
        room.visual.poly(_.map(positions, (p) => [p.x, p.y]), { stroke: "#77f" });
    },
    build: function(proxy, exit) {
        // keeping number of construction sites in low-level rooms down
        if(proxy.room.controller.level < 5) return;

        eachWallPosition(exit, (pos) => proxy.planConstruction(pos.x, pos.y, STRUCTURE_RAMPART));
    },
    updateCostMatrix: function(matrix, exit) { },
    addBuilding: function(memory, flag) { },
    removeBuilding: function(memory, flag) {
        let edge = posToEdge(flag.pos);
        let pos = flag.pos[edgeMappings[edge].parallel];
        let wall = _.find(memory, (w) => w.edge === edge && w.start <= pos && w.end >= pos);

        if(wall) {
            let index = _.findIndex(memory, wall);
            if(index >= 0) memory.splice(index, 1);
        }
    },
    plan: function(spaceFinder, buildings, room) {
        let existingWalls = _.map(_.filter(buildings, (b) => b.type === this.type), (b) => b.memory);
        let result = [];
        let currentExit = {};
        for(let pos of room.find(FIND_EXIT)) {
            if(!extendExit(currentExit, pos)) {
                if(currentExit.edge && !_.any(existingWalls, (w) => w.edge === currentExit.edge && w.start === currentExit.start)) result.push(currentExit);

                let edge = posToEdge(pos);
                currentExit = {
                    edge: edge,
                    start: pos[edgeMappings[edge].parallel],
                    end: pos[edgeMappings[edge].parallel]
                };
            }
        }

        if(currentExit.edge && !_.any(existingWalls, (w) => w.edge === currentExit.edge && w.start === currentExit.start)) result.push(currentExit);

        return result;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.exitWalls');
