const PathBuilder = require("pathbuilder");

const DEFAULT_STUCK_LIMIT = 5;

// TODO:
//  - long range routing
//  - don't cache path on "hot" options (e.g. avoidHostiles)
//  - more options (e.g. allow to path over hostile structures only)

module.exports = class CreepMover {
    constructor(creep, target, options) {
        this.creep = creep;
        this.target = target;
        this.options = options || {};
        this.pathBuilder = this.configurePathBuilder(this.options);
    }

    move() {
        if(!this.target) return ERR_INVALID_TARGET;
        if(this.creep.fatigue > 0) return ERR_TIRED;

        let targetRange = this.options.range || this.rangeByTarget();
        let target = { pos: this.target.pos, range: Math.max(1, targetRange) };
        if(this.creep.pos.getRangeTo(target) <= targetRange) return OK;

        let data = this.deserializeData();
        if(!CreepMover.samePos(data.target, target.pos)) {
            data.path = null;
        } else if(CreepMover.samePos(this.creep.pos, data.lastPos)) {
            data.stuck += 1;
            if(data.stuck >= (this.options.stuckLimit || DEFAULT_STUCK_LIMIT)) {
                data.path = null;
                this.pathBuilder.avoidCreeps = true;
            }
        } else {
            data.stuck = 0;
            if(data.path) {
                let expectedPos = CreepMover.nextCoord(data.lastPos, this.nextDir(data));
                if(CreepMover.sameCoord(this.creep.pos, expectedPos)) {
                    data.path = data.path.substr(1);
                    if(data.path.length === 0) data.path = null;
                } else {
                    console.log("CreepMover (" + this.creep.name + "): unexpected movement. Expected: " + expectedPos.x + "|" + expectedPos.y + " Got: " + this.creep.pos.x + "|" + this.creep.pos.y);
                    data.path = null;
                }
            }
        }

        if(!data.path) {
            data.target = target.pos;
            if(this.creep.pos.isNearTo(target)) {
                data.path = this.creep.pos.getDirectionTo(target).toString();
            } else {
                let options = {
                    plainCost: this.pathBuilder.plainCost,
                    swampCost: this.pathBuilder.swampCost,
                    roomCallback: this.pathBuilder.getRoomCallback()
                };

                options = Object.assign({}, this.options, options);
                let result = PathFinder.search(this.creep.pos, target, options);
                data.path = CreepMover.serializePath(this.creep.pos, result.path);
            }
        }

        this.serializeData(data);
        return this.creep.move(this.nextDir(data));
    }

    configurePathBuilder(builderOptions) {
        let builder = new PathBuilder();
        if(this.options.debugCosts) builder.debugCosts = true;
        if(this.options.avoidHostiles) builder.avoidHostiles = true;
        if(this.options.preferRoads === false) builder.preferRoads = false;
        return builder;
    }

    rangeByTarget() {
        if(this.target.structureType && OBSTACLE_OBJECT_TYPES.includes(this.target.structureType)) {
            return 1;
        } else if(Game.map.getTerrainAt(this.target.pos) === "wall") {
            return 1;
        }

        return 0;
    }

    deserializeData() {
        let data = this.creep.memory._goto;
        if(!data) {
            return {
              lastPos: null,
              target: null,
              stuck: 0,
              path: null
            };
        }
        if(data.lastPos) data.lastPos = new RoomPosition(data.lastPos.x, data.lastPos.y, this.creep.room.name);
        if(data.target) data.target = new RoomPosition(data.target.x, data.target.y, data.target.roomName);

        return data;
    }

    serializeData(data) {
        this.creep.memory._goto = {
            lastPos: { x: this.creep.pos.x, y: this.creep.pos.y },
            target: { x: data.target.x, y: data.target.y, roomName: data.target.roomName },
            stuck: data.stuck,
            path: data.path
        };
    }

    nextDir(data) {
        return parseInt(data.path[0], 10);
    }

    static samePos(posA, posB) {
        if(!!posA !== !!posB) return false;
        return posA.roomName === posB.roomName && posA.x === posB.x && posA.y === posB.y;
    }
    
    static sameCoord(posA, posB) {
        if(!!posA !== !!posB) return false;
        return posA.x === posB.x && posA.y === posB.y;
    }
    
    static nextCoord(origin, direction) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        let x = origin.x + offsetX[direction];
        let y = origin.y + offsetY[direction];
        
        // correctly predict position when switching room
        if(x === 0) x = 49;
        else if(x === 49) x = 0;
        else if(y === 0) y = 49;
        else if(y === 49) y = 0;
        
        return { x: x, y: y };
    }

    // Taken from Traveler (https://github.com/bonzaiferroni/Traveler)
    static serializePath(startPos, path) {
        let serializedPath = "";
        let lastPosition = startPos;
        for (let position of path) {
            if (position.roomName === lastPosition.roomName) {
                serializedPath += lastPosition.getDirectionTo(position);
            }
            lastPosition = position;
        }
        return serializedPath;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'CreepMover');
