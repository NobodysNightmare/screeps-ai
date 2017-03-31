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
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'PowerAspect');
