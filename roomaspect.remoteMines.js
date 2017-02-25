const carrier = require('role.carrier');
const defender = require('role.defender');
const miner = require('role.miner');
const observer = require('role.observer');
const reserver = require('role.reserver');

const logistic = require("helper.logistic");
const spawnHelper = require("helper.spawning");

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
            var hostile = remoteRoom.find(FIND_HOSTILE_CREEPS)[0];
            remoteRoom.memory.primaryHostile = hostile && hostile.id;
            if(!hostile) return;

            var hasDefender = _.any(spawnHelper.globalCreepsWithRole(defender.name), (c) => c.memory.room == remoteRoom.name);
            if(!hasDefender) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, defender.meeleeConfigs), { role: defender.name, room: remoteRoom.name, originRoom: room.name });
            }
        },
        spawnReserver: function(remoteRoom) {
            var needReservation = !remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000;
            var hasReserver = _.any(spawnHelper.globalCreepsWithRole(reserver.name), (c) => c.memory.target == remoteRoom.controller.id);
            if(needReservation && !hasReserver) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.controller.id });
            }
        },
        spawnMiners: function(remoteRoom) {
            for(var source of remoteRoom.find(FIND_SOURCES)) {
                var hasMiner = _.any(spawnHelper.globalCreepsWithRole(miner.name), (c) => c.memory.target == source.id);
                if(!hasMiner) {
                    roomai.spawn(spawnHelper.bestAvailableParts(room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true });
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
                        selfSustaining: true
                    };
                    roomai.spawn(spawnHelper.bestAvailableParts(room, carrier.configsForCapacity(this.neededCollectorCapacity(source), { workParts: 1 })), memory);
                }
            }
        },
        spawnObserver: function(roomName) {
            if(!_.any(spawnHelper.globalCreepsWithRole(observer.name), (c) => c.memory.target == roomName)) {
                roomai.spawn(observer.parts, { role: observer.name, target: roomName });
            }
        },
        neededCollectorCapacity: function(source) {
            // back and forth while 10 energy per tick are generated
            var needed = logistic.distanceByPath(source, room.storage) * 20;
            // adding at least one extra CARRY to make up for inefficiencies
            return _.min([needed + 60, 2000]);
        }
    }
};
