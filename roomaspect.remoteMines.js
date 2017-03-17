const carrier = require('role.carrier');
const defender = require('role.defender');
const miner = require('role.miner');
const observer = require('role.observer');
const reserver = require('role.reserver');

const logistic = require("helper.logistic");
const spawnHelper = require("helper.spawning");
const ff = require("helper.friendFoeRecognition");

const profitVisual = require("visual.roomProfit");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!room.storage) return;
            if(!room.memory.remoteMines) return;

            for(var roomName of room.memory.remoteMines) {
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
        },
        spawnDefender: function(remoteRoom) {
            var hostile = ff.findHostiles(remoteRoom)[0];
            remoteRoom.memory.primaryHostile = hostile && hostile.id;
            if(!hostile) return;

            var hasDefender = _.any(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == remoteRoom.name);
            if(!hasDefender) {
                this.spawn(spawnHelper.bestAvailableParts(room, defender.meeleeConfigs), { role: defender.name, room: remoteRoom.name, originRoom: room.name }, remoteRoom.name);
            }
        },
        spawnReserver: function(remoteRoom) {
            var needReservation = !remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000;
            var hasReserver = _.any(spawnHelper.globalCreepsWithRole(reserver.name), (c) => c.memory.target == remoteRoom.controller.id);
            if(needReservation && !hasReserver) {
                this.spawn(spawnHelper.bestAvailableParts(room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.controller.id }, remoteRoom.name);
            }
        },
        spawnMiners: function(remoteRoom) {
            for(var source of remoteRoom.find(FIND_SOURCES)) {
                var hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id);
                if(!hasMiner) {
                    this.spawn(spawnHelper.bestAvailableParts(room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true }, remoteRoom.name);
                }
            }
        },
        spawnCarriers: function(remoteRoom) {
            for(var source of remoteRoom.find(FIND_SOURCES)) {
                var hasStore = logistic.storeFor(source);
                var hasCarrier = _.any(spawnHelper.globalCreepsWithRole(carrier.name), (c) => c.memory.source == source.id);
                if(hasStore && !hasCarrier) {
                    let memory = {
                        role: carrier.name,
                        source: source.id,
                        destination: room.storage.id,
                        resource: RESOURCE_ENERGY,
                        selfSustaining: true,
                        registerRevenueFor: remoteRoom.name
                    };
                    this.spawn(spawnHelper.bestAvailableParts(room, carrier.configsForCapacity(this.neededCollectorCapacity(source), { workParts: 1 })), memory, remoteRoom.name);
                }
            }
        },
        spawnObserver: function(roomName) {
            if(!_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == roomName)) {
                this.spawn(observer.parts, { role: observer.name, target: roomName }, roomName);
            }
        },
        neededCollectorCapacity: function(source) {
            // back and forth while 10 energy per tick are generated
            var needed = logistic.distanceByPath(source, room.storage) * 20;
            // adding at least one extra CARRY to make up for inefficiencies
            return _.min([needed + 60, 2000]);
        },
        spawn: function(parts, memory, targetRoom) {
            let result = roomai.spawn(parts, memory);
            if(_.isString(result)) {
                profitVisual.addCost(targetRoom, spawnHelper.costForParts(parts));
            }
        }
    }
};
