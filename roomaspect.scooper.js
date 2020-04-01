const spawnHelper = require("helper.spawning");
const scooper = require("role.scooper");

module.exports = class ScooperAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, scooper.name) >= 1) return;
        if(this.roomai.defense.defcon >= 2) return;

        let resources = this.room.find(FIND_DROPPED_RESOURCES);
        if(!_.any(resources, (r) => r.resourceType === RESOURCE_ENERGY ? r.amount >= 300 : r.amount >= 100)) return;

        this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, scooper.configs(100)), { role: scooper.name, home: this.room.name, target: this.room.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ScooperAspect');
