const spawnHelper = require("helper.spawning");
const attacker = require("role.attacker");
const dismantler = require("role.dismantler");
const healer = require("role.healer");

const keyStructures = [STRUCTURE_SPAWN, STRUCTURE_TOWER];

module.exports = class AttackOperation extends Operation {
    constructor(memory) {
        super(memory);

        if(!this.memory.attackerCount) this.memory.attackerCount = 1;
        if(this.memory.attackRole !== "dismantler") this.memory.attackRole = "attacker";
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

    get attackRole() {
        return this.memory.attackRole === "attacker" ? attacker : dismantler;
    }

    run() {
        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick + CREEP_LIFE_TIME) {
            Operation.removeOperation(this);
        }

        if(this.memory.terminateAfterSuccess && this.targetPosition.room) {
            if(this.targetPosition.room.find(FIND_HOSTILE_STRUCTURES, { filter: (s) => keyStructures.includes(s.structureType) }).length === 0) {
                Operation.removeOperation(this);
            }
        }

        this.attackers = _.filter(spawnHelper.globalCreepsWithRole(this.attackRole.name), (c) => c.memory.operation === this.id);
        if(!this.memory.nextWaveAt || this.memory.nextWaveAt < Game.time) {
            this.memory.nextWaveAt = Game.time + CREEP_LIFE_TIME;
            this.memory.missingAttackers = this.memory.attackerCount;
        }
    }

    supportRoomCallback(room) {
        if(!this.isValid()) return;

        let roomai = room.ai();

        this.requestBoosts(roomai);

        if(this.memory.terminateAfterTick && Game.time > this.memory.terminateAfterTick) return;

        if(this.memory.useHeal) this.spawnHealers(roomai);

        if(this.memory.missingAttackers > 0) {
            let memory = { role: this.attackRole.name, target: this.targetPosition, operation: this.id };
            let configs = this.attackRole.configs();
            if(this.memory.useHeal) memory["waitFor"] = true;
            if(this.memory.useTough) configs = [this.attackRole.toughConfig(15)];

            let spawnResult = roomai.spawn(spawnHelper.bestAvailableParts(roomai.room, configs), memory);
            if(_.isString(spawnResult)) {
                this.memory.missingAttackers -= 1;
            }
        }
    }

    drawVisuals() {
        let targetPos = this.targetPosition;
        if(targetPos) {
            let visual = new RoomVisual(targetPos.roomName);

            visual.text(`X`, targetPos.x, targetPos.y, { align: "center", color: "#f00", stroke: "#000" });
            RoomUI.forRoom(targetPos.roomName).addRoomCaption(`Attacking from ${this.memory.supportRoom} with ${this.memory.attackerCount} ${this.attackRole.name}s`);
            RoomUI.forRoom(this.memory.supportRoom).addRoomCaption(`Attacking ${targetPos.roomName} with ${this.memory.attackerCount} ${this.attackRole.name}s (next wave in ${this.memory.nextWaveAt - Game.time})`);
        }
    }

    requestBoosts(roomai) {
        roomai.labs.requestBoost(this.attackRole.mainBoost, 40);
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
