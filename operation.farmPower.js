const boosting = require("helper.boosting");
const spawnHelper = require("helper.spawning");
const observer = require("role.observer");
const healer = require("role.healer");
const powerFarmer = require("role.powerFarmer");
const scooper = require("role.scooper");

module.exports = class FarmPowerOperation {
    constructor(roomai, targetFlag, count) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetRoomName = targetFlag.pos.roomName;
        this.farmerCount = count;
    }

    run() {
        if(!this.roomai.canSpawn()) return;
        if(this.roomai.defense.defcon >= 4) return;

        let targetRoom = Game.rooms[this.targetRoomName];
        let powerBank = targetRoom && targetRoom.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_POWER_BANK }).shift();

        let healers = spawnHelper.globalCreepsWithRole(healer.name);
        let farmers = _.filter(spawnHelper.globalCreepsWithRole(powerFarmer.name), (c) => c.memory.target == this.targetRoomName);

        if(this.roomai.observer.isAvailable()) {
            this.roomai.observer.observeLater(this.targetRoomName);
        }

        for(let farmerCreep of farmers) {
            if(!_.any(healers, (c) => c.memory.target == farmerCreep.name)) {
                let healerParts = spawnHelper.makeParts(25, MOVE, 25, HEAL);
                this.roomai.spawn(healerParts, boosting.disable({ role: healer.name, target: farmerCreep.name }));
            }
        }

        if(targetRoom) {
            let remainingDamage = _.sum(farmers, (c) => (c.ticksToLive || 0) * c.getActiveBodyparts(ATTACK).length * ATTACK_POWER);
            let timeToArrival = 120 + 200; // approx. spawn + approx. travel time
            if(powerBank && remainingDamage <= powerBank.hits && _.filter(farmers, (c) => !c.ticksToLive || c.ticksToLive > timeToArrival).length < this.farmerCount) {
                this.roomai.spawn(powerFarmer.parts, { role: powerFarmer.name, target: this.targetRoomName });
            }

            if(powerBank && powerBank.hits < 300000) {
                let scoopers = _.filter(spawnHelper.globalCreepsWithRole(scooper.name), (c) => c.memory.target == this.targetRoomName);
                if(_.sum(scoopers, (c) => c.getActiveBodyparts(CARRY) * CARRY_CAPACITY) < powerBank.power) {
                    this.roomai.spawn(scooper.configs(1000)[0], { role: scooper.name, target: this.targetRoomName, home: this.room.name });
                }
            }
        } else {
            if(!this.roomai.observer.isAvailable() && !_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == this.targetRoomName)) {
                this.roomai.spawn(observer.parts, { role: observer.name, target: this.targetRoomName });
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FarmPowerOperation');
