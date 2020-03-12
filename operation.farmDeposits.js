const spawnHelper = require("helper.spawning");
const observer = require("role.observer");
const miner = require("role.miner");
const carrier = require("role.carrier");

module.exports = class FarmDepositsOperation {
    static get canSkipFlag() {
        return true;
    }

    constructor(roomai, targetFlag) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.flag = targetFlag;
        this.minerCount = 1;
        this.carrierCount = 2;
        this.maxCooldown = 60;

        if(!this.room.memory.depositFarms) {
            this.room.memory.depositFarms = [];
        }
    }

    run() {
        if(this.flag) {
            this.addOrRemoveFarm(this.flag.pos.roomName);
            this.flag.remove();
        }

        if(this.roomai.defense.defcon >= 4) return;

        for(let roomName of this.room.memory.depositFarms) {
            this.performColdObservation(roomName);

            let targetRoom = Game.rooms[roomName];
            let deposit = targetRoom && targetRoom.find(FIND_DEPOSITS).shift();
            if(deposit) {
                this.observe(roomName);
                this.spawnForDeposit(deposit);
            }
        }
    }

    addOrRemoveFarm(roomName) {
        if(this.room.memory.depositFarms.includes(roomName)) {
            this.room.memory.depositFarms = _.reject(this.room.memory.depositFarms, (r) => r === roomName);
            console.log(this.room.name + ": Removed deposit farm " + roomName);
        } else {
            this.room.memory.depositFarms.push(roomName);
            console.log(this.room.name + ": Added deposit farm " + roomName);
        }

        console.log(this.room.name + ": New list of farms is " + this.room.memory.depositFarms);
    }

    performColdObservation(roomName) {
        let checkInterval = this.room.memory.depositFarms.length + 50;
        if(Game.time % checkInterval !== 0) return;

        this.observe(roomName);
    }

    observe(roomName) {
        if(this.roomai.observer.isAvailable()) {
            this.roomai.observer.observeLater(roomName);
        } else if(!Game.rooms[roomName] && !_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == roomName)) {
            this.roomai.spawn(observer.parts, { role: observer.name, target: roomName });
        }
    }

    spawnForDeposit(deposit) {
        if(!this.roomai.canSpawn()) return;

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

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'FarmDepositsOperation');
