const spawnHelper = require("helper.spawning");
const downgrader = require("role.downgrader");

module.exports = class DowngradeOperation extends Operation {
    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let roomai = room.ai();

        if(!roomai.canSpawn()) return;

        let downgraders = _.filter(spawnHelper.globalCreepsWithRole(downgrader.name), (c) => c.memory.operation === this.id);

        if(downgraders.length === 0) {
            roomai.spawn(spawnHelper.bestAvailableParts(roomai.room, downgrader.configs()), { role: downgrader.name, room: this.memory.targetRoom, operation: this.id });
        }
    }

    drawVisuals() {
        let targetRoom = this.memory.targetRoom;
        if(targetRoom) {
            RoomUI.forRoom(targetRoom).addRoomCaption(`Downgrading controller from ${this.memory.supportRoom}`);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DowngradeOperation');
