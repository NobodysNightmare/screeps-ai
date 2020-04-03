const spawnHelper = require("helper.spawning");

const healer = require("role.healer");
const hopper = require("role.hopper");

module.exports = class DrainOperation {
    constructor(roomai, targetFlag, count, drainSetup) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetRoom = targetFlag.pos.roomName;
        this.hopperCount = count;
        this.useBoosts = drainSetup > 1;
    }

    run() {
        if(this.useBoosts) this.requestBoosts();
        if(!this.roomai.canSpawn()) return;

        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        let hoppers = _.filter(spawnHelper.globalCreepsWithRole(hopper.name), (c) => c.memory.room == this.targetRoom);

        for(let hopperCreep of hoppers) {
            if(!_.any(healers, (c) => c.memory.target == hopperCreep.name)) {
                let healerParts;
                if(hopperCreep.spawning) {
                    healerParts = spawnHelper.bestAvailableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                } else {
                    healerParts = spawnHelper.bestAffordableParts(this.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                }
                this.roomai.spawn(healerParts, { role: healer.name, target: hopperCreep.name, avoidRooms: [this.targetRoom] });
            }
        }

        if(hoppers.length < this.hopperCount) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, hopper.configs()), { role: hopper.name, room: this.targetRoom });
        }
    }

    requestBoosts() {
        // TODO: also support TOUGH boost on hopper
        this.roomai.labs.requestBoost("XLHO2", 30);
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DrainOperation');
