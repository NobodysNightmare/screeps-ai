function eachWallPosition(wall, callback) {
    let x = wall.start.x;
    let y = wall.start.y;
    let xDir = wall.start.x < wall.end.x ? 1 : -1;
    let yDir = wall.start.y < wall.end.y ? 1 : -1;

    for(x; x != wall.end.x; x += xDir) callback({ x: x, y: y });
    for(y; y != wall.end.y; y += yDir) callback({ x: x, y: y });
    callback({ x: wall.end.x, y: wall.end.y });
}

// builds a wall between start and end position.
// "pure" walls are made entirely of ramparts (any non-first-color flag)
module.exports = {
    outline: function(room, wall) {
        let start = wall.start;
        let end = wall.end;

        if(end) {
            room.visual.poly([[start.x, start.y], [end.x, start.y], [end.x, end.y]], { stroke: "#77f" });
        } else {
            room.visual.poly([[start.x - 0.5, start.y], [start.x + 0.5, start.y]], { stroke: "#f77" });
        }
    },
    build: function(proxy, wall) {
        if(!wall.end) return;

        // keeping number of construction sites in low-level rooms down
        if(proxy.room.controller.level < 3) return;

        proxy.planConstruction(wall.end.x, wall.end.y, STRUCTURE_RAMPART);
        let lastWasWall = true;
        eachWallPosition(wall, (pos) => {
            if(wall.pure || lastWasWall) {
                proxy.planConstruction(pos.x, pos.y, STRUCTURE_RAMPART);
            } else {
                proxy.planConstruction(pos.x, pos.y, STRUCTURE_WALL);
            }

            lastWasWall = !lastWasWall;
        });
    },
    updateCostMatrix: function(matrix, wall) {
        if(wall.pure) return;

        let isWall = false;
        eachWallPosition(wall, (pos) => {
            if(isWall) {
                if(pos.x !== wall.end.x || pos.y !== wall.end.y) {
                    matrix.set(pos.x, pos.y, 255);
                }
            }

            isWall = !isWall;
        });
    },
    addBuilding: function(memory, flag) {
        let lastWall = _.last(memory);
        if(!lastWall) {
            memory.push({ start: { x: flag.pos.x, y: flag.pos.y } });
        } else if(lastWall.end) {
            memory.push({ start: { x: flag.pos.x, y: flag.pos.y } });
        } else {
            lastWall.end = { x: flag.pos.x, y: flag.pos.y };
            if(flag.color > 1) lastWall.pure = true;
        }
    },
    removeBuilding: function(memory, flag) {
        let index = _.findIndex(memory, (w) => (w.start.x == flag.pos.x && w.start.y == flag.pos.y) || (w.end.x == flag.pos.x && w.end.y == flag.pos.y));
        if(index >= 0) memory.splice(index, 1);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'construction.tower');
