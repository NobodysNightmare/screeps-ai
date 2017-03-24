const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");

module.exports = class AttackOperation {
    constructor(roomai, targetFlag, count) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.attackerCount = count;
    }

    run() {
        if(!this.roomai.canSpawn()) return;

        let attackers = _.filter(spawnHelper.globalCreepsWithRole(attacker.name), (c) => c.memory.flag == this.targetFlag.name);

        if(attackers.length < this.attackerCount) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, attacker.meleeConfigs()), { role: attacker.name, flag: this.targetFlag.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'AttackOperation');
