const carrier = require('role.carrier');
const defender = require('role.defender');
const miner = require('role.miner');
const observer = require('role.observer');
const reserver = require('role.reserver');

const logistic = require("helper.logistic");
const spawnHelper = require("helper.spawning");
const ff = require("helper.friendFoeRecognition");

const profitVisual = require("visual.roomProfit");

const secondCarrierMinCapacity = 400;

module.exports = class RemoteMinesAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
    }

    run() {
        if(!this.room.storage) return;
        if(!this.room.memory.remoteMines) return;

        for(var roomName of this.room.memory.remoteMines) {
            var remoteRoom = Game.rooms[roomName];
            if(remoteRoom) {
                if(this.spawnDefender(remoteRoom)) continue;
                this.spawnReserver(remoteRoom);
                for(let source of remoteRoom.find(FIND_SOURCES)) {
                    this.spawnMiner(source);
                    this.spawnCarrier(source);
                }
            } else {
                this.spawnObserver(roomName);
            }
        }
    }

    spawnDefender(remoteRoom) {
        let remoteOwner = remoteRoom.controller.owner && remoteRoom.controller.owner.username;
        var hostile = ff.findHostiles(remoteRoom, { filter: (c) => c.owner.username !== remoteOwner })[0];
        if(!hostile) return false;

        if(!this.roomai.canSpawn()) return true;
        var hasDefender = _.any(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == remoteRoom.name);
        if(!hasDefender) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, defender.meeleeConfigs()), { role: defender.name, room: remoteRoom.name, originRoom: this.room.name }, remoteRoom.name);
        }

        return true;
    }

    spawnReserver(remoteRoom) {
        if(!this.roomai.canSpawn()) return;

        var needReservation = !remoteRoom.controller.owner && (!remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000);
        var hasReserver = _.any(spawnHelper.globalCreepsWithRole(reserver.name), (c) => c.memory.target == remoteRoom.controller.id);
        if(needReservation && !hasReserver) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.controller.id }, remoteRoom.name);
        }
    }

    spawnMiner(source) {
        if(!this.roomai.canSpawn()) return;

        var hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id);
        if(!hasMiner) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true }, source.room.name);
        }
    }

    spawnCarrier(source) {
        if(!this.roomai.canSpawn()) return;

        let hasStore = logistic.storeFor(source);
        let carrierCapacity = _.sum(_.filter(spawnHelper.globalCreepsWithRole(carrier.name), (c) => c.memory.source == source.id), (c) => _.filter(c.body, (p) => p.type === CARRY).length) * CARRY_CAPACITY;
        let neededCapacity = this.neededCollectorCapacity(source);
        let missingCapacity = neededCapacity - carrierCapacity;
        if(hasStore && (carrierCapacity == 0 || missingCapacity >= secondCarrierMinCapacity)) {
            let memory = {
                role: carrier.name,
                source: source.id,
                destination: this.room.storage.id,
                resource: RESOURCE_ENERGY,
                selfSustaining: true,
                registerRevenueFor: source.room.name
            };
            this.spawn(spawnHelper.bestAvailableParts(this.room, carrier.configsForCapacity(missingCapacity, { workParts: 1 })), memory, source.room.name);
        }
    }

    spawnObserver(roomName) {
        if(!_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == roomName)) {
            this.spawn(observer.parts, { role: observer.name, target: roomName }, roomName);
        }
    }

    neededCollectorCapacity(source) {
        // back and forth while 10 energy per tick are generated
        var needed = logistic.distanceByPath(source, this.room.storage) * 20;
        // adding at least one extra CARRY to make up for inefficiencies
        return _.min([needed + 60, 2000]);
    }

    spawn(parts, memory, targetRoom) {
        let result = this.roomai.spawn(parts, memory);
        if(_.isString(result)) {
            profitVisual.addCost(targetRoom, spawnHelper.costForParts(parts));
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RemoteMinesAspect');
