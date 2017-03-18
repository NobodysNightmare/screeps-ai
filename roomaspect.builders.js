var spawnHelper = require("helper.spawning");
var builder = require("role.builder");

module.exports = class BuildersAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, builder.name) >= 2) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, builder.partConfigs);
        this.roomai.spawn(parts, { role: builder.name });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'BuildersAspect');
