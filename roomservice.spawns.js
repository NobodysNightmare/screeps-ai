module.exports = class Spawns {
    constructor(room) {
        this.room = room;
        this.spawns = room.find(FIND_MY_SPAWNS);
        this.availableSpawns = _.filter(this.spawns, (s) => !s.spawning);
        this.primary = this.spawns[0];
    }

    spawn(parts, memory) {
        let spawn = this.availableSpawns[0];
        if(!spawn || this.spawnReserved) {
            return false;
        }

        let name = this.nameCreep(memory.role);
        let result = spawn.spawnCreep(parts, name, {
                                        memory: memory,
                                        energyStructures: this.energyStructures
                                    });
        if(result === OK) {
            this.availableSpawns.shift();
            return name; // be compatible with old spawn API
        } else if(result === ERR_NOT_ENOUGH_ENERGY) {
            this.spawnReserved = true;
        } else {
            console.log(this.room.name + " - Unexpected spawn result: " + result);
        }

        return result;
    }

    canSpawn() {
        return !this.spawnReserved && this.availableSpawns.length > 0;
    }

    renderOverlay() {
        for(let spawn of this.spawns) {
            this.renderSpawnOverlay(spawn);
        }
    }

    renderSpawnOverlay(spawn) {
        if(spawn.spawning) {
            let role = Game.creeps[spawn.spawning.name].memory.role;
            let remaining = spawn.spawning.remainingTime;
            spawn.room.visual.rect(spawn.pos.x - 1.3, spawn.pos.y + 0.9, 2.6, 0.6,{fill: '#333', opacity: 0.8, stroke: '#fff', strokeWidth: 0.03 });
            spawn.room.visual.text(role, spawn.pos.x - 0.0, spawn.pos.y + 1.3, { align: "center", size: 0.4 });
            spawn.room.visual.circle(spawn.pos, {fill: '#000000', radius: 0.5, opacity: 0.8 });
            spawn.room.visual.text(remaining, spawn.pos.x - 0.0, spawn.pos.y + 0.2, { align: "center", size: 0.6 })
        }
    }

    nameCreep(role) {
        let rolePart = role ? (role + "-") : "";
        let id = this.fetchCreepId().toString();
        return rolePart + id + "-" + Game.shard.name;
    }

    fetchCreepId() {
        let id = (Memory.nextCreepId || 0) % 10000;
        Memory.nextCreepId = id + 1;
        return id;
    }

    get energyStructures() {
        if(!this._energyStructures) {
            let structures = this.room.find(FIND_MY_STRUCTURES, {
                                                filter: (s) => s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION
                                            });
            let reference = this.room.storage || this.primary.pos.findClosestByRange(FIND_SOURCES);
            this._energyStructures = _.sortBy(structures, (s) => s.pos.getRangeTo(reference));
        }

        return this._energyStructures;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Spawns');
