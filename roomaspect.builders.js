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

        let parts = spawnHelper.bestAvailableParts(this.room, builder.configs(this.numberOfWorkParts()));
        this.roomai.spawn(parts, { role: builder.name });
    }

    numberOfWorkParts() {
        let constructionMass = _.sum(this.room.find(FIND_MY_CONSTRUCTION_SITES), (cs) => cs.progressTotal - cs.progress);
        if(constructionMass >= 20000) {
            return 20;
        } else {
            return 6;
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'BuildersAspect');
