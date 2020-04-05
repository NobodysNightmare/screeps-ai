const spawnHelper = require("helper.spawning");
const nukeOperator = require("role.nukeOperator");

module.exports = class NukerAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.nuker = this.room.nuker();
    }

    run() {
        if(!this.nuker) return;
        if(this.nuker.cooldown > 10000) return;

        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, nukeOperator.name) >= 1) return;

        let missingEnergy = this.nuker.store.getFreeCapacity(RESOURCE_ENERGY);
        let missingGhodium = this.nuker.store.getFreeCapacity(RESOURCE_GHODIUM);

        if(missingEnergy === 0 && missingGhodium === 0) return;

        this.roomai.spawn(nukeOperator.parts, { role: nukeOperator.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'NukerAspect');
