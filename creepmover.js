const PathBuilder = require("pathbuilder");
const RouteFinder = require("routefinder");

const DEFAULT_STUCK_LIMIT = 5;

const MINIMUM_OPS = 2000; // default value for PathFinder
const OPS_PER_ROOM = 1000; // pathing a route of N rooms can take up to N CPU

// TODO:
//  - don't cache path on "hot" options (e.g. avoidHostiles)
//  - more options (e.g. allow to path over hostile structures only)

module.exports = class CreepMover {
    constructor(creep, target, options) {
        this.creep = creep;
        this.target = target;
        this.options = options || {};
        this.routeFinder = new RouteFinder(creep.room.name, target.pos.roomName);
        this.pathBuilder = this.configurePathBuilder(this.creep, this.options);
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
            data.stuck = 0;
        } else if(CreepMover.samePos(this.creep.pos, data.lastPos)) {
            data.stuck += 1;
        } else {
            if(data.path) {
                let expectedPos = CreepMover.nextCoord(data.lastPos, this.nextDir(data));
                if(CreepMover.sameCoord(this.creep.pos, expectedPos)) {
                    data.path = data.path.substr(1);
                    if(data.path.length === 0) data.path = null;
                } else if(CreepMover.sameCoord(this.creep.pos, CreepMover.coordInDirection(data.lastPos, this.nextDir(data)))) {
                    // nextCoord and coordInDirection are different:
                    // creep moved correctly into a room exit but got back
                    // either due to fatigue or because of a blocking creep on other side
                    // increase stuck count in case of block, but return immediately,
                    // waiting to be back on correct side of the exit
                    if(this.creep.memory.debugPath) {
                        this.log("Creep moved backwards through exit portal. Waiting another tick.");
                    }
                    data.stuck += 1;
                    return OK;
                } else {
                    this.log("Unexpected movement. Expected: " + expectedPos.x + "|" + expectedPos.y + " Got: " + this.creep.pos.x + "|" + this.creep.pos.y);
                    data.path = null;
                }
            }

            data.stuck = 0;
        }

        if(data.stuck >= (this.options.stuckLimit || DEFAULT_STUCK_LIMIT)) {
            data.path = null;
            this.pathBuilder.avoidCreeps = true;
        }

        if(!data.path) {
            data.target = target.pos;
            if(this.creep.pos.isNearTo(target)) {
                data.path = this.creep.pos.getDirectionTo(target).toString();
            } else {
                let allowedRooms = this.routeFinder.findRoute();
                this.pathBuilder.allowedRooms = allowedRooms;
                let options = {
                    plainCost: this.pathBuilder.plainCost,
                    swampCost: this.pathBuilder.swampCost,
                    roomCallback: this.pathBuilder.getRoomCallback(),
                    maxOps: Math.max(MINIMUM_OPS, OPS_PER_ROOM * allowedRooms.length)
                };

                options = Object.assign({}, this.options, options);
                let result = PathFinder.search(this.creep.pos, target, options);
                if(result.incomplete) {
                    this.log("Could not find complete path from " + this.creep.pos + " to " +  this.target.pos + ".");
                }
                data.path = CreepMover.serializePath(this.creep.pos, result.path);
            }
        }

        this.serializeData(data);
        return this.creep.move(this.nextDir(data));
    }

    configurePathBuilder(creep, builderOptions) {
        let builder = new PathBuilder();
        if(creep.memory.debugPath) builder.debugCosts = true;
        if(builderOptions.avoidHostiles) builder.avoidHostiles = true;
        if(builderOptions.preferRoads === false) builder.preferRoads = false;
        return builder;
    }

    rangeByTarget() {
        if(this.target.structureType && OBSTACLE_OBJECT_TYPES.includes(this.target.structureType)) {
            return 1;
        } else if(Game.map.getRoomTerrain(this.target.pos.roomName).get(this.target.pos.x, this.target.pos.y) === TERRAIN_MASK_WALL) {
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

    log(message) {
        console.log("CreepMover (" + this.creep.name + "): " + message);
    }

    static samePos(posA, posB) {
        if(!!posA !== !!posB) return false;
        return posA.roomName === posB.roomName && posA.x === posB.x && posA.y === posB.y;
    }

    static sameCoord(posA, posB) {
        if(!!posA !== !!posB) return false;
        return posA.x === posB.x && posA.y === posB.y;
    }

    // returns coordinate in given direction from origin
    static coordInDirection(origin, direction) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        let x = origin.x + offsetX[direction];
        let y = origin.y + offsetY[direction];

        return { x: x, y: y };
    }

    // returns coordinate that creep will be next tick when
    // moving into given direction (considering room exits)
    static nextCoord(origin, direction) {
        let result = CreepMover.coordInDirection(origin, direction);

        // correctly predict position when switching room
        if(result.x === 0) result.x = 49;
        else if(result.x === 49) result.x = 0;
        else if(result.y === 0) result.y = 49;
        else if(result.y === 49) result.y = 0;

        return result;
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
