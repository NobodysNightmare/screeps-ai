const spawnHelper = require("helper.spawning");
const observer = require("role.observer");
const miner = require("role.miner");
const carrier = require("role.carrier");

module.exports = class FarmDepositsOperation {
    constructor(roomai, targetFlag) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.targetRoomName = targetFlag.pos.roomName;
        this.minerCount = 1;
        this.carrierCount = 2;
        this.maxCooldown = 60;
    }

    run() {
        if(!this.roomai.canSpawn()) return;

        let targetRoom = Game.rooms[this.targetRoomName];
        let deposit = targetRoom && targetRoom.find(FIND_DEPOSITS).shift();

        if(this.roomai.observer.isAvailable()) {
            this.roomai.observer.observeLater(this.targetRoomName);
        } else if(!targetRoom && !_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == this.targetRoomName)) {
            this.roomai.spawn(observer.parts, { role: observer.name, target: this.targetRoomName });
        }

        if(deposit) {
            let miners = _.filter(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == deposit.id);
            let minerIds = _.map(miners, (m) => m.id);
            let carriers = _.filter(spawnHelper.globalCreepsWithRole(carrier.name), (c) => minerIds.includes(c.memory.source));

            for(let minerCreep of miners) {
                if(_.filter(carriers, (c) => c.memory.source == minerCreep.id).length < this.carrierCount) {
                    let carrierParts = spawnHelper.makeParts(25, CARRY, 25, MOVE); // TODO: get smaller for high cooldown Deposits?
                    let memory = {
                        role: carrier.name,
                        source: minerCreep.id,
                        destination: this.room.storage.id,
                        resource: minerCreep.memory.resource,
                        waitTicks: 50
                    };
                    this.roomai.spawn(carrierParts, memory);
                }
            }

            if(deposit.lastCooldown > this.maxCooldown) return;

            let timeToArrival = 120 + 200; // approx. spawn + approx. travel time
            if(_.filter(miners, (c) => !c.ticksToLive || c.ticksToLive > timeToArrival).length < this.minerCount) {
                this.roomai.spawn(miner.depositParts, { role: miner.name, target: deposit.id, targetRoom: deposit.room.name, resource: deposit.depositType });
            }
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FarmDepositsOperation');
