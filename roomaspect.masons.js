var spawnHelper = require("helper.spawning");
var mason = require("role.mason");

module.exports = class MasonsAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.roomai.canSpawn() || _.filter(spawnHelper.globalCreepsWithRole(mason.name), (c) => c.memory.room == this.room.name).length >= this.masonCount()) {
            return;
        }

        let parts = spawnHelper.bestAvailableParts(this.room, mason.configs(16));
        this.roomai.spawn(parts, { role: mason.name, room: this.room.name });
    }
    
    masonCount() {
        if(!this.room.storage) return 0;
        
        return Math.max(this.neededForNukes(), this.neededForWalls());
    }
    
    neededForNukes() {
        let nukes = this.room.find(FIND_NUKES);
        return Math.min(nukes.length, 2);
    }

    neededForWalls() {
        if(this.room.storage.store.energy < 200000) {
            return 0;
        } else if(this.room.storage.store.energy < 300000) {
            return this.roomai.mode == "walls" ? 1 : 0;
        } else if(this.room.storage.store.energy < 400000) {
            return this.roomai.mode == "walls" ? 2 : 1;
        } else {
            return this.roomai.mode == "walls" ? 3 : 2;
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'MasonsAspect');
