const spawnHelper = require("helper.spawning");
const claimer = require("role.claimer");
const conqueror = require("role.conqueror");
const miner = require("role.miner");

module.exports = class ClaimOperation {
    constructor(roomai, targetFlag) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
    }

    run() {
        let targetRoom = this.targetFlag.room;
        if(targetRoom && targetRoom.find(FIND_MY_SPAWNS).length > 0) {
            this.kickstartRoom(targetRoom);
        } else {
            let claimers = _.filter(spawnHelper.globalCreepsWithRole(claimer.name), (c) => c.memory.flag == this.targetFlag.name);
            let conquerors = _.filter(spawnHelper.globalCreepsWithRole(conqueror.name), (c) => c.memory.flag == this.targetFlag.name);
            let myRoom = targetRoom && targetRoom.controller.my;
            let needClaimer = claimers.length == 0 && !myRoom;

            if(needClaimer) {
                let roomCount = _.filter(Game.rooms, (r) => r.controller && r.controller.my).length;
                if(roomCount >= Game.gcl.level) {
                    // do not spawn anything if we don't own the room and can't claim it yet
                    return;
                }
                this.roomai.spawn(claimer.parts, { role: claimer.name, flag: this.targetFlag.name });
            }

            if(conquerors.length < 2) {
                this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, conqueror.configs()), { role: conqueror.name, flag: this.targetFlag.name });
            }
            
            if(myRoom) {
                targetRoom.createConstructionSite(this.targetFlag.pos, STRUCTURE_SPAWN);
            }
        }
    }

    kickstartRoom(remoteRoom) {
        if(remoteRoom.controller.level > 4) return;
        if(!this.roomai.canSpawn()) return;

        for(let source of remoteRoom.find(FIND_SOURCES)) {
            // only considering maxed out miners
            let hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id && miner.countWorkParts(c) == 5);
            if(!hasMiner) {
                this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true });
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ClaimOperation');
