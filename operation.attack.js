const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const healer = require("role.healer");

module.exports = class AttackOperation extends Operation {
    constructor(memory) {
        super(memory);

        if(!this.memory.attackerCount) this.memory.attackerCount = 1;
        if(this.memory.timeout) {
            this.memory.terminateAfter = Game.time + this.memory.timeout;
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
        if(this.memory.terminateAfter && Game.time > this.memory.terminateAfter + CREEP_LIFE_TIME) {
            Operation.removeOperation(this);
        }

        this.attackers = _.filter(spawnHelper.globalCreepsWithRole(attacker.name), (c) => c.memory.operation === this.id);
    }

    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let roomai = room.ai();

        this.requestBoosts(roomai);

        if(this.memory.terminateAfter && Game.time > this.memory.terminateAfter) return;

        if(this.memory.useHeal) this.spawnHealers(roomai);

        if(this.attackers.length < this.memory.attackerCount) {
            let memory = { role: attacker.name, target: this.targetPosition, operation: this.id };
            let configs = attacker.meleeConfigs();
            if(this.memory.useHeal) memory["waitFor"] = true;
            if(this.memory.useTough) configs = [attacker.toughConfig(15)];

            roomai.spawn(spawnHelper.bestAvailableParts(roomai.room, configs), memory);
        }
    }

    drawVisuals() {
        let targetPos = this.targetPosition;
        if(targetPos) {
            let visual = new RoomVisual(targetPos.roomName);

            visual.text(`X`, targetPos.x, targetPos.y, { align: "center", color: "#f00", stroke: "#000" });
            visual.text(`Attacking from ${this.memory.supportRoom}`, 49, 0, { align: "right", color: "#fff", stroke: "#000" });
        }
    }

    requestBoosts(roomai) {
        roomai.labs.requestBoost("XUH2O", 40);
        if(this.memory.useHeal) roomai.labs.requestBoost("XLHO2", 50);
        if(this.memory.useTough) {
            roomai.labs.requestBoost("XGHO2", 45);
            roomai.labs.requestBoost("XZHO2", 44);
        }
    }

    spawnHealers(roomai) {
        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        for(let attackerCreep of this.attackers) {
            if(!_.any(healers, (c) => c.memory.target === attackerCreep.name)) {
                let healerParts = spawnHelper.bestAvailableParts(roomai.room, healer.configs({ minHeal: 5, maxHeal: 25, healRatio: 1 }));
                if(this.memory.useTough) healerParts = healer.toughConfig(15);
                let spawnResult = roomai.spawn(healerParts, { role: healer.name, target: attackerCreep.name, operation: this.id });
                if(_.isString(spawnResult)) {
                    attackerCreep.memory.waitFor = spawnResult;
                }
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'AttackOperation');
