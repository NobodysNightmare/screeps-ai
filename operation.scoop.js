const spawnHelper = require("helper.spawning");
const scooper = require("role.scooper");

module.exports = class ScoopOperation {
    constructor(roomai, targetFlag, count) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetFlag = targetFlag;
        this.scooperCount = count;
    }

    run() {
        if(!this.roomai.canSpawn()) return;
        
        let targetRoom = this.targetFlag.room;
        let scoopers = _.filter(spawnHelper.globalCreepsWithRole(scooper.name), (c) => c.memory.target === this.targetFlag.pos.roomName && c.memory.home === this.room.name);

        if(scoopers.length < this.scooperCount) {
            this.roomai.spawn(spawnHelper.bestAvailableParts(this.room, scooper.configs(1000)), { role: scooper.name, home: this.room.name, target: this.targetFlag.pos.roomName });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ScoopOperation');
