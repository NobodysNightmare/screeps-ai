const spawnHelper = require("helper.spawning");
const scooper = require("role.scooper");

module.exports = class ScoopOperation extends Operation {
    constructor(memory) {
        super(memory);

        if(!this.memory.scooperCount) this.memory.scooperCount = 1;
        if(this.memory.timeout) {
            this.memory.terminateAfterTick = Game.time + this.memory.timeout;
            delete this.memory.timeout;
        }
    }

    run() {
        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick) {
            Operation.removeOperation(this);
        }

        if(this.memory.terminateWhenEmpty) {
            let targetRoom = Game.rooms[this.memory.targetRoom];
            if(targetRoom) {
                let storageEmpty = targetRoom.storage && _.sum(targetRoom.storage.store) === 0;
                let terminalEmpty = targetRoom.terminal && _.sum(targetRoom.terminal.store) === 0;
                let noStores = !targetRoom.storage && !targetRoom.terminal;
                if(noStores || (storageEmpty && terminalEmpty)) {
                    Operation.removeOperation(this);
                }
            }
        }
    }

    supportRoomCallback(room) {
        let roomai = room.ai();

        if(!roomai.canSpawn()) return;

        let scoopers = _.filter(spawnHelper.globalCreepsWithRole(scooper.name), (c) => c.memory.operation === this.id);

        if(scoopers.length < this.memory.scooperCount) {
            roomai.spawn(spawnHelper.bestAvailableParts(room, scooper.configs(1000)), { role: scooper.name, home: room.name, target: this.memory.targetRoom, operation: this.id });
        }
    }

    drawVisuals() {
        let targetRoom = this.memory.targetRoom;
        if(targetRoom) {
            RoomUI.forRoom(targetRoom).addRoomCaption(`Scooping room from ${this.memory.supportRoom} with ${this.memory.scooperCount} scoopers`);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ScoopOperation');
