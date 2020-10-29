var spawnHelper = require("helper.spawning");
var mason = require("role.mason");

const MAX_WALLS = 299950000;
const MIN_WALLS = 200000;

module.exports = class MasonsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(this.roomai.defense.defcon >= 4) this.roomai.labs.requestBoost("XLH2O", 60);

        if(!this.roomai.canSpawn() || _.filter(spawnHelper.globalCreepsWithRole(mason.name), (c) => c.memory.room == this.room.name).length >= this.masonCount()) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, mason.configs(16));
        this.roomai.spawn(parts, { role: mason.name, room: this.room.name });
    }

    masonCount() {
        if(!this.room.storage) return 0;

        return Math.max(this.neededForNukes(), this.neededForWalls(), this.neededForDefense());
    }

    neededForNukes() {
        let nukes = this.room.find(FIND_NUKES);
        return Math.min(nukes.length, 2);
    }

    neededForWalls() {
        let wallHeight = _.min(_.map(this.room.ai().defense.borderStructures, (s) => s.hits));

        if(wallHeight == 0 || wallHeight >= MAX_WALLS) return 0;
        if(this.room.storage.store.energy < 150000) return 0;

        let result = 0;
        if(this.roomai.mode == "walls") result++;
        if(this.room.storage.store.energy > 150000 && wallHeight < MIN_WALLS) result++;
        if(this.room.storage.store.energy > 300000) result++;
        if(this.room.storage.store.energy > 400000) result++;


        return result;
    }

    neededForDefense() {
        if(this.roomai.defense.defcon >= 4) return 2;

        return 0;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MasonsAspect');
