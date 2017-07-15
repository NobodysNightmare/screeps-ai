const spawnHelper = require("helper.spawning");
const dismantler = require("role.dismantler");
const healer = require("role.healer");

module.exports = class DismantleOperation {
    constructor(roomai, targetFlag, count, dismantleSetup) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.dismantlerCount = count;
        this.useHeal = dismantleSetup > 1;
        this.useTough = dismantleSetup > 2;
    }

    run() {
        if(!this.roomai.canSpawn()) return;

        let dismantlers = _.filter(spawnHelper.globalCreepsWithRole(dismantler.name), (c) => c.memory.flag == this.targetFlag.name);

        if(this.useHeal) this.spawnHealers(dismantlers);

        if(dismantlers.length < this.dismantlerCount) {
            let memory = { role: dismantler.name, flag: this.targetFlag.name };
            let parts = spawnHelper.bestAvailableParts(this.room, dismantler.configs());
            if(this.useHeal) memory["waitFor"] = true;
            if(this.useTough) parts = dismantler.toughConfig(15);
            this.roomai.spawn(parts, memory);
        }
    }

    spawnHealers(dismantlers) {
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        for(let dismantlerCreep of dismantlers) {
            if(!_.any(healers, (c) => c.memory.target === dismantlerCreep.name)) {
                let healerParts = spawnHelper.bestAvailableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                if(this.useTough) healerParts = healer.toughConfig(15);
                let spawnResult = this.roomai.spawn(healerParts, { role: healer.name, target: dismantlerCreep.name });
                if(_.isString(spawnResult)) {
                    dismantlerCreep.memory.waitFor = spawnResult;
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DismantleOperation');
