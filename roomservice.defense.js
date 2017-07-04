const gateCache = {};
const CACHE_TTL = 30;

module.exports = class Defense {
    constructor(room) {
        this.room = room;
    }

    get gates() {
        if(!this._gates) {
            this._gates = this.findGates();
        }

        return this._gates;
    }

    get walls() {
        if(!this._walls) {
            this._walls = this.findWalls();
        }

        return this._walls;
    }

    get borderStructures() {
        return this.gates.concat(this.walls);
    }

    findGates() {
        let cache = gateCache[this.room.name];
        if(cache && cache.time > Game.time - CACHE_TTL) return _.compact(_.map(cache.result, (id) => Game.getObjectById(id)));

        cache = gateCache[this.room.name] = { time: Game.time };

        let result = this.room.find(FIND_MY_STRUCTURES, { filter: function(structure) {
                if(structure.structureType !== STRUCTURE_RAMPART) return false;

                let otherStructures = structure.pos.lookFor(LOOK_STRUCTURES);
                let isBlocked = _.some(otherStructures, (s) => s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD);
                return !isBlocked;
            } });

        cache.result = _.map(result, (s) => s.id);
        return result;
    }

    findWalls() {
        return this.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_WALL });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Defense');
