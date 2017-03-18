const carrier = require('role.carrier');
const defender = require('role.defender');
const miner = require('role.miner');
const observer = require('role.observer');
const reserver = require('role.reserver');

const logistic = require("helper.logistic");
const spawnHelper = require("helper.spawning");
const ff = require("helper.friendFoeRecognition");

const profitVisual = require("visual.roomProfit");

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
                this.spawnDefender(remoteRoom);
                this.spawnReserver(remoteRoom);
                this.spawnMiners(remoteRoom);
                this.spawnCarriers(remoteRoom);
            } else {
                this.spawnObserver(roomName);
            }
        }
    }

    spawnDefender(remoteRoom) {
        var hostile = ff.findHostiles(remoteRoom)[0];
        remoteRoom.memory.primaryHostile = hostile && hostile.id;
        if(!hostile) return;

        var hasDefender = _.any(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == remoteRoom.name);
        if(!hasDefender) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, defender.meeleeConfigs), { role: defender.name, room: remoteRoom.name, originRoom: this.room.name }, remoteRoom.name);
        }
    }

    spawnReserver(remoteRoom) {
        var needReservation = !remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000;
        var hasReserver = _.any(spawnHelper.globalCreepsWithRole(reserver.name), (c) => c.memory.target == remoteRoom.controller.id);
        if(needReservation && !hasReserver) {
            this.spawn(spawnHelper.bestAvailableParts(this.room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.controller.id }, remoteRoom.name);
        }
    }

    spawnMiners(remoteRoom) {
        for(var source of remoteRoom.find(FIND_SOURCES)) {
            var hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id);
            if(!hasMiner) {
                this.spawn(spawnHelper.bestAvailableParts(this.room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true }, remoteRoom.name);
            }
        }
    }

    spawnCarriers(remoteRoom) {
        for(var source of remoteRoom.find(FIND_SOURCES)) {
            var hasStore = logistic.storeFor(source);
            var hasCarrier = _.any(spawnHelper.globalCreepsWithRole(carrier.name), (c) => c.memory.source == source.id);
            if(hasStore && !hasCarrier) {
                let memory = {
                    role: carrier.name,
                    source: source.id,
                    destination: this.room.storage.id,
                    resource: RESOURCE_ENERGY,
                    selfSustaining: true,
                    registerRevenueFor: remoteRoom.name
                };
                this.spawn(spawnHelper.bestAvailableParts(this.room, carrier.configsForCapacity(this.neededCollectorCapacity(source), { workParts: 1 })), memory, remoteRoom.name);
            }
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
