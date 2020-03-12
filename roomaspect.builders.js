var spawnHelper = require("helper.spawning");
var builder = require("role.builder");

module.exports = class BuildersAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, builder.name) >= this.numberOfBuilders()) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, builder.configs(this.numberOfWorkParts()));
        this.roomai.spawn(parts, { role: builder.name, room: this.room.name });
    }

    numberOfWorkParts() {
        if(this.constructionMass >= 20000) {
            return 20;
        } else {
            return 8;
        }
    }

    numberOfBuilders() {
        if(this.constructionMass >= 5000) {
            return 2;
        } else {
            return 1;
        }
    }

    get constructionMass() {
        if(this._constructionMass === undefined) {
            this._constructionMass = _.sum(this.room.find(FIND_MY_CONSTRUCTION_SITES), (cs) => cs.progressTotal - cs.progress);
        }

        return this._constructionMass;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'BuildersAspect');
