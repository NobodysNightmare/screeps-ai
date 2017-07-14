const spawnHelper = require("helper.spawning");
const dismantler = require("role.dismantler");

module.exports = class DismantleOperation {
    constructor(roomai, targetFlag, count) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.dismantlerCount = count;
    }

    run() {
        if(!this.roomai.canSpawn()) return;
        
        let targetRoom = this.targetFlag.room;
        let dismantlers = _.filter(spawnHelper.globalCreepsWithRole(dismantler.name), (c) => c.memory.flag == this.targetFlag.name);

        if(dismantlers.length < this.dismantlerCount) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, dismantler.configs()), { role: dismantler.name, flag: this.targetFlag.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DismantleOperation');
