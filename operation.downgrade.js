const spawnHelper = require("helper.spawning");
const downgrader = require("role.downgrader");

module.exports = class DowngradeOperation {
    constructor(roomai, targetFlag) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
    }

    run() {
        if(!this.roomai.canSpawn()) return;
        
        let targetRoom = this.targetFlag.room;
        let downgraders = _.filter(spawnHelper.globalCreepsWithRole(downgrader.name), (c) => c.memory.flag == this.targetFlag.name);

        if(downgraders.length === 0) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, downgrader.configs()), { role: downgrader.name, flag: this.targetFlag.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DowngradeOperation');
