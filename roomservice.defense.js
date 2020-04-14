const ff = require("helper.friendFoeRecognition");

const gateCache = {};
const CACHE_TTL = 30;

/* Defcon level is intended to give an indication about the severeness of
* an attack and can be used to increase response force.
* Defcon 0: Peace
* Defcon 1: Short-lived attack (most often NPCs)
*           * Keep turrets supplied
* Defcon 2: Attack that wasn't defeated within short time (strong NPCs?)
*           * Spawn guards
* Defcon 3: Guards were not able to defeat intruders
*           * Boost guards
*           * stop dangerous remote mining
* Defcon 4: This is going to take a long time...
*           * Keep walls fortified
*           * Decrease non-vital spawn and energy load
* ...
*
* Fetch the current Defcon level using
*
*     defense.defcon;
*/
const DEFCONS = [
    { level: 0, escalateAt: 1, cooldown: 0 },
    { level: 1, escalateAt: 50, cooldown: 100 },
    { level: 2, escalateAt: 500, cooldown: 300 },
    { level: 3, escalateAt: 1000, cooldown: 500 },
    { level: 4, escalateAt: null, cooldown: 500 }
]

function escalateDefcon(defcon) {
    let reference = DEFCONS[defcon.level];

    defcon.progress += 1;
    defcon.cooldown = Math.min(defcon.cooldown + 1, reference.cooldown);

    if(reference.escalateAt && defcon.progress >= reference.escalateAt) {
        defcon.level += 1;
        defcon.progress = 0;
        defcon.cooldown = DEFCONS[defcon.level].cooldown;
    }
}

function deescalateDefcon(defcon) {
    if(defcon.level === 0) return;
    if(defcon.cooldown > 0) defcon.cooldown -= 1;
    if(defcon.cooldown <= 0) {
        defcon.level -= 1;
        defcon.progress = 0;
        defcon.cooldown = DEFCONS[defcon.level].cooldown;
    }
}

module.exports = class Defense {
    constructor(room) {
        this.room = room;
        if(this.room.memory.defense) {
            this.memory = this.room.memory.defense;
        } else {
            this.memory = {};
            this.room.memory.defense = this.memory;
        }

        if(!this.memory.defcon) {
            this.memory.defcon = {
                level: 0,
                progress: 0,
                cooldown: 0
            };
        }
    }

    get hostiles() {
        if(!this._hostiles) this._hostiles = ff.findHostiles(this.room);

        return this._hostiles;
    }

    get defcon() {
        return this.memory.defcon.level;
    }

    updateDefcon() {
        let defcon = this.memory.defcon;
        if(this.hostiles.length > 0) {
            escalateDefcon(defcon);
        } else {
            deescalateDefcon(defcon);
        }
    }

    displayDefcon() {
        let defcon = this.memory.defcon;
        if(defcon.level === 0) return;
        RoomUI.forRoom(this.room).addRoomCaption(`Defcon ${defcon.level} (${defcon.progress} T; CD ${defcon.cooldown} T)`, { color: "#faa"});
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
