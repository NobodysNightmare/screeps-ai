const spawnHelper = require("helper.spawning");
const ranger = require("role.ranger");

module.exports = class RangerOperation {
    constructor(roomai, targetFlag, count) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.rangerCount = count;
    }

    run() {
        if(!this.roomai.canSpawn()) return;

        let rangers = _.filter(spawnHelper.globalCreepsWithRole(ranger.name), (c) => c.memory.flag == this.targetFlag.name);

        if(rangers.length < this.rangerCount) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, ranger.configs()), { role: ranger.name, flag: this.targetFlag.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RangerOperation');
