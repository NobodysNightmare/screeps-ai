const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const healer = require("role.healer");

module.exports = class AttackOperation {
    constructor(roomai, targetFlag, count, attackSetup) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.attackerCount = count;
        this.useHeal = attackSetup > 1;
    }

    run() {
        if(!this.roomai.canSpawn()) return;

        let attackers = _.filter(spawnHelper.globalCreepsWithRole(attacker.name), (c) => c.memory.flag == this.targetFlag.name);

        if(this.useHeal) this.spawnHealers(attackers);

        if(attackers.length < this.attackerCount) {
            let memory = { role: attacker.name, flag: this.targetFlag.name };
            if(this.useHeal) memory["waitFor"] = true;
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, attacker.meleeConfigs()), memory);
        }
    }

    spawnHealers(attackers) {
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        for(let attackerCreep of attackers) {
            if(!_.any(healers, (c) => c.memory.target === attackerCreep.name)) {
                let healerParts = spawnHelper.bestAvailableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                let spawnResult = this.roomai.spawn(healerParts, { role: healer.name, target: attackerCreep.name, avoidRooms: [this.targetRoom] });
                if(_.isString(spawnResult)) {
                    attackerCreep.memory.waitFor = spawnResult;
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'AttackOperation');
