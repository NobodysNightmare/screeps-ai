const ff = require("helper.friendFoeRecognition");
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

    get targetRoom() {
        return Game.rooms[this.memory.targetRoom];
    }

    run() {
        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick) {
            Operation.removeOperation(this);
        }

        if(this.memory.terminateWhenEmpty) {
            if(this.targetRoom) {
                let targetRoom = this.targetRoom;
                let storageEmpty = targetRoom.storage && _.sum(targetRoom.storage.store) === 0;
                let terminalEmpty = targetRoom.terminal && _.sum(targetRoom.terminal.store) === 0;
                let noStores = !targetRoom.storage && !targetRoom.terminal;
                if(noStores || (storageEmpty && terminalEmpty)) {
                    Operation.removeOperation(this);
                }
            }
        }

        if(this.memory.waitForClear) {
            this.wait = true;
            if(this.targetRoom) {
                let hostilesPresent = ff.findHostiles(this.targetRoom).length > 0;
                let towersPresent = this.targetRoom.find(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_TOWER }).length > 0;

                if(!hostilesPresent && !towersPresent) this.wait = false;
            }
        }
    }

    supportRoomCallback(room) {
        let roomai = room.ai();

        if(this.memory.waitForClear && roomai.observer.isAvailable()) {
            if(Game.time % 10 === 0) roomai.observer.observeLater(this.memory.targetRoom);
        }

        if(!roomai.canSpawn()) return;
        if(this.wait) return;

        let scoopers = _.filter(spawnHelper.globalCreepsWithRole(scooper.name), (c) => c.memory.operation === this.id);

        if(scoopers.length < this.memory.scooperCount) {
            roomai.spawn(spawnHelper.bestAvailableParts(room, scooper.configs(1000)), { role: scooper.name, home: room.name, target: this.memory.targetRoom, operation: this.id });
        }
    }

    drawVisuals() {
        let targetRoom = this.memory.targetRoom;
        if(targetRoom) {
            let caption = `Scooping room from ${this.memory.supportRoom} with ${this.memory.scooperCount} scoopers`;
            let options = {};
            if(this.wait) {
                caption = `${caption} (waiting)`;
                options = { color: "#ccc" };
            }
            
            RoomUI.forRoom(targetRoom).addRoomCaption(caption, options);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'ScoopOperation');
