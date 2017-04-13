var spawnHelper = require("helper.spawning");
var mason = require("role.mason");

module.exports = class MasonsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.room.memory.constructions || !this.room.memory.constructions.walls[0]) return;
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, mason.name) >= this.masonCount()) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, mason.configs(16));
        this.roomai.spawn(parts, { role: mason.name, room: this.room.name });
    }

    masonCount() {
        if(!this.room.storage) return 0;

        if(this.room.storage.store.energy < 210000) {
            return 0;
        } else if(this.room.storage.store.energy < 300000) {
            return 1;
        } else {
            return 2;
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MasonsAspect');
