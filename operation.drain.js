const spawnHelper = require("helper.spawning");

const healer = require("role.healer");
const hopper = require("role.hopper");

module.exports = class DrainOperation extends Operation {
    constructor(memory) {
        super(memory);

        if(this.memory.timeout) {
            this.memory.terminateAfterTick = Game.time + this.memory.timeout;
            delete this.memory.timeout;
        }
    }

    run() {
        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick) {
            Operation.removeOperation(this);
        }
    }

    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let roomai = room.ai();

        if(this.memory.useBoosts) this.requestBoosts(roomai);
        if(!roomai.canSpawn()) return;

        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        let hoppers = _.filter(spawnHelper.globalCreepsWithRole(hopper.name), (c) => c.memory.operation === this.id && (c.ticksToLive > this.creepRenewDuration(room) || !c.ticksToLive));

        for(let hopperCreep of hoppers) {
            if(!_.any(healers, (c) => c.memory.target === hopperCreep.name)) {
                let healerParts;
                if(hopperCreep.spawning) {
                    healerParts = spawnHelper.bestAvailableParts(room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                } else {
                    healerParts = spawnHelper.bestAffordableParts(room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                }
                roomai.spawn(healerParts, { role: healer.name, target: hopperCreep.name, avoidRooms: [this.memory.targetRoom], operation: this.id });
            }
        }

        if(hoppers.length < 1) {
            roomai.spawn(spawnHelper.bestAvailableParts(room, hopper.configs()), { role: hopper.name, room: this.memory.targetRoom, operation: this.id });
        }
    }

    drawVisuals() {
        let targetRoom = this.memory.targetRoom;
        if(targetRoom) {
            RoomUI.forRoom(targetRoom).addRoomCaption(`Draining room from ${this.memory.supportRoom}`);
        }
    }

    requestBoosts(roomai) {
        // TODO: also support TOUGH boost on hopper
        roomai.labs.requestBoost("XLHO2", 30);
    }

    creepRenewDuration(startRoom) {
        const spawnDuration = 150;
        let travelTime = Game.map.getRoomLinearDistance(startRoom, this.memory.targetRoom) * 50;
        return spawnDuration + travelTime;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DrainOperation');
