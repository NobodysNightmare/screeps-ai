const spawnHelper = require("helper.spawning");
const refiner = require("role.powerRefiner");

const powerModes = ["normal", "power"];

module.exports = class PowerAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.powerSpawn = this.room.powerSpawn();
    }

    run() {
        if(!this.powerSpawn) return;
        if(!powerModes.includes(this.roomai.mode)) return;
        if(this.roomai.defense.defcon >= 4) return;

        this.powerSpawn.processPower();

        if(!this.room.storage || this.room.storage.store.energy < 275000 || !this.room.storage.store[RESOURCE_POWER]) return;
        if(Memory.sellPower && this.room.storage.store.energy < 500000) return;
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, refiner.name) >= 1) return;

        this.roomai.spawn(refiner.parts, { role: refiner.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'PowerAspect');
