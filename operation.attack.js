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
        this.useTough = attackSetup > 2;
    }

    run() {
        this.requestBoosts();

        if(!this.roomai.canSpawn()) return;

        let attackers = _.filter(spawnHelper.globalCreepsWithRole(attacker.name), (c) => c.memory.flag == this.targetFlag.name);

        if(this.useHeal) this.spawnHealers(attackers);

        if(attackers.length < this.attackerCount) {
            let memory = { role: attacker.name, flag: this.targetFlag.name };
            let parts = spawnHelper.bestAvailableParts(this.room, attacker.meleeConfigs());
            if(this.useHeal) memory["waitFor"] = true;
            if(this.useTough) parts = attacker.toughConfig(15);
            this.roomai.spawn(parts, memory);
        }
    }

    requestBoosts() {
        this.roomai.labs.requestBoost("XUH2O", 40);
        if(this.useHeal) this.roomai.labs.requestBoost("XLHO2", 50);
        if(this.useTough) {
            this.roomai.labs.requestBoost("XGHO2", 45);
            this.roomai.labs.requestBoost("XZHO2", 44);
        }
    }

    spawnHealers(attackers) {
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        for(let attackerCreep of attackers) {
            if(!_.any(healers, (c) => c.memory.target === attackerCreep.name)) {
                let healerParts = spawnHelper.bestAvailableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                if(this.useTough) healerParts = healer.toughConfig(15);
                let spawnResult = this.roomai.spawn(healerParts, { role: healer.name, target: attackerCreep.name });
                if(_.isString(spawnResult)) {
                    attackerCreep.memory.waitFor = spawnResult;
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'AttackOperation');
