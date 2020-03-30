const spawnHelper = require("helper.spawning");
const ranger = require("role.ranger");

module.exports = class RangerOperation {
    constructor(roomai, targetFlag, count, attackSetup) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.rangerCount = count;
        this.useBoost = attackSetup > 1;
    }

    run() {
        if(this.useBoost) this.requestBoosts();

        if(!this.roomai.canSpawn()) return;

        let parts = spawnHelper.bestAvailableParts(this.room, ranger.configs());
        let leadTime = spawnHelper.spawnDuration(parts) + 50; // 50 ticks to be able to move at least one room
        let rangers = _.filter(spawnHelper.globalCreepsWithRole(ranger.name), (c) => c.memory.flag == this.targetFlag.name && (!c.ticksToLive || c.ticksToLive > leadTime));

        if(rangers.length < this.rangerCount) {
            this.roomai.spawn(parts, { role: ranger.name, flag: this.targetFlag.name });
        }
    }

    requestBoosts() {
        this.roomai.labs.requestBoost("XKHO2", 40);
        this.roomai.labs.requestBoost("XLHO2", 50);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RangerOperation');
