const spawnHelper = require("helper.spawning");
const dismantler = require("role.dismantler");
const healer = require("role.healer");

module.exports = class DismantleOperation extends Operation {
    constructor(memory) {
        super(memory);

        if(!this.memory.dismantlerCount) this.memory.dismantlerCount = 1;
        if(this.memory.timeout) {
            this.memory.terminateAfterTick = Game.time + this.memory.timeout;
            delete this.memory.timeout;
        }
    }

    get targetPosition() {
        if(!this.memory.targetPosition) return null;
        return AbsolutePosition.deserialize(this.memory.targetPosition);
    }

    set targetPosition(pos) {
        this.memory.targetPosition = pos.toJSON();
    }

    run() {
        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick + CREEP_LIFE_TIME) {
            Operation.removeOperation(this);
        }

        this.dismantlers = _.filter(spawnHelper.globalCreepsWithRole(dismantler.name), (c) => c.memory.operation === this.id);
    }

    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let roomai = room.ai();

        this.requestBoosts(roomai);

        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick) return;

        if(this.memory.useHeal) this.spawnHealers(roomai);

        if(this.dismantlers.length < this.memory.dismantlerCount) {
            let memory = { role: dismantler.name, target: this.targetPosition, operation: this.id };
            let configs = dismantler.configs();
            if(this.memory.useHeal) memory["waitFor"] = true;
            if(this.memory.useTough) configs = [dismantler.toughConfig(15)];

            roomai.spawn(spawnHelper.bestAvailableParts(roomai.room, configs), memory);
        }
    }

    drawVisuals() {
        let targetPos = this.targetPosition;
        if(targetPos) {
            let visual = new RoomVisual(targetPos.roomName);

            visual.text(`X`, targetPos.x, targetPos.y, { align: "center", color: "#f00", stroke: "#000" });
            RoomUI.forRoom(targetPos.roomName).addRoomCaption(`Dismantling from ${this.memory.supportRoom}`);
        }
    }

    requestBoosts(roomai) {
        roomai.labs.requestBoost("XZH2O", 40);
        if(this.memory.useHeal) roomai.labs.requestBoost("XLHO2", 50);
        if(this.memory.useTough) {
            roomai.labs.requestBoost("XGHO2", 45);
            roomai.labs.requestBoost("XZHO2", 44);
        }
    }

    spawnHealers(roomai) {
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        for(let dismantlerCreep of this.dismantlers) {
            if(!_.any(healers, (c) => c.memory.target === dismantlerCreep.name)) {
                let healerParts = spawnHelper.bestAvailableParts(roomai.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                if(this.memory.useTough) healerParts = healer.toughConfig(15);
                let spawnResult = roomai.spawn(healerParts, { role: healer.name, target: dismantlerCreep.name, operation: this.id });
                if(_.isString(spawnResult)) {
                    dismantlerCreep.memory.waitFor = spawnResult;
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'DismantleOperation');
