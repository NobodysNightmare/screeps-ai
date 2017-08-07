const ff = require("helper.friendFoeRecognition");

const AVOID_HOSTILE_COST = 5;

module.exports = class PathBuilder {
    constructor() {
        this.avoidHostiles = false;
    }
    
    // returns a callback to be used in Room.findPath
    getAdditiveCallback() {
        let builder = this;
        return function additiveCallback(roomName, matrix) {
            if(builder.avoidHostiles) {
                builder.doAvoidHostiles(roomName, matrix);
            }
        };
    }
    
    doAvoidHostiles(roomName, matrix) {
        let room = Game.rooms[roomName];
        if(!room) return;
        
        let hostiles = ff.findHostiles(room);
        for(let hostile of hostiles) {
            let range = 0;
            if(_.some(hostile.body, (p) => p.type === RANGED_ATTACK)) range = 3;
            else if(_.some(hostile.body, (p) => p.type === ATTACK)) range = 1;
            if(range === 0) continue;
            
            for(let dx = -range; dx <= range; dx += 1) {
                for(let dy = -range; dy <= range; dy += 1) {
                    let x = hostile.pos.x + dx;
                    let y = hostile.pos.y + dy;
                    if(Game.map.getTerrainAt(x, y, roomName) !== "wall") matrix.set(x, y, AVOID_HOSTILE_COST);
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'PathBuilder');
