const spawnHelper = require("helper.spawning");
const refiner = require("role.powerRefiner");

module.exports = class PowerAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        if(this.room.controller.level == 8) {
            this.powerSpawn = this.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN })[0];
        }
    }

    run() {
        if(!this.powerSpawn) return;
        this.powerSpawn.processPower();

        if(!this.room.storage || this.room.storage.store.energy < 275000 || !this.room.storage.store[RESOURCE_POWER]) return;
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(refiner.name) >= 1) return;

        roomai.spawn(refiner.parts, { role: refiner.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'PowerAspect');
