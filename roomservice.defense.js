const ff = require("helper.friendFoeRecognition");

const gateCache = {};
const CACHE_TTL = 30;

module.exports = class Defense {
    constructor(room) {
        this.room = room;
        if(this.room.memory.defense) {
            this.memory = this.room.memory.defense;
        } else {
            this.memory = {};
            this.room.memory.defense = this.memory;
        }
    }

    get hostiles() {
        if(!this._hostiles) this._hostiles = ff.findHostiles(this.room);

        return this._hostiles;
    }

    get primaryHostile() {
        let primaryHostile = Game.getObjectById(this.room.memory.primaryHostile);

        if(!primaryHostile || primaryHostile.pos.roomName != this.room.name) {
            primaryHostile = null;
            if(this.hostiles.length > 0) {
                primaryHostile = this.hostiles[0];
            }

            this.room.memory.primaryHostile = primaryHostile && primaryHostile.id;
        }

        return primaryHostile;
    }

    get attackTime() {
        return this.memory.attackTime || 0;
    }

    updateAttackTimes() {
        if(this.hostiles.length > 0) {
            if(!this.memory.attackTime) this.memory.attackTime = 0;
            this.memory.attackTime += 1;
            this.memory.attackCooldown = 100;
        } else {
            if(this.memory.attackCooldown > 0) this.memory.attackCooldown -= 1;

            if(this.memory.attackCooldown == 0) {
                this.memory.attackTime = 0;
            }
        }
    }

    displayAttackTime() {
        if(this.attackTime == 0) return;
        this.room.visual.text("Attack time: " + this.attackTime, 0, 1, { align: "left", color: "#faa", stroke: "#000" });
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
