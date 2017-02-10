const carrier = require('role.carrier');
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
                    this.spawnReserver(remoteRoom);
                    this.spawnMiners(remoteRoom);
                    this.spawnCarriers(remoteRoom);
                } else {
                    this.spawnObserver(roomName);
                }
            }
        },
        spawnReserver: function(remoteRoom) {
            var needReservation = !remoteRoom.controller.reservation || remoteRoom.controller.reservation.ticksToEnd < 2000;
            var hasReserver = _.any(Game.creeps, (c) => c.memory.role == reserver.name && c.memory.target == remoteRoom.name);
            if(needReservation && !hasReserver) {
                roomai.spawn(spawnHelper.bestAvailableParts(room, reserver.partConfigs), { role: reserver.name, target: remoteRoom.name });
            }
        },
        spawnMiners: function(remoteRoom) {
            for(var source of remoteRoom.find(FIND_SOURCES)) {
                var hasMiner = _.any(Game.creeps, (c) => c.memory.role == miner.name && c.memory.target == source.id);
                if(!hasMiner) {
                    roomai.spawn(spawnHelper.bestAvailableParts(room, miner.energyConfigs), { role: miner.name, target: source.id, resource: RESOURCE_ENERGY, selfSustaining: true });
                }
            }
        },
        spawnCarriers: function(remoteRoom) {
            for(var source of remoteRoom.find(FIND_SOURCES)) {
                var hasStore = logistic.storeFor(source);
                var hasCarrier = _.any(Game.creeps, (c) => c.memory.role == carrier.name && c.memory.source == source.id);
                if(hasStore && !hasCarrier) {
                    // TODO: find right carrier size
                    roomai.spawn(spawnHelper.bestAvailableParts(room, carrier.partConfigs), { role: carrier.name, source: source.id, destination: room.storage.id });
                }
            }
        },
        spawnObserver: function(roomName) {
            if(!_.any(Game.creeps, (c) => c.memory.role == observer.name && c.memory.target == roomName)) {
                roomai.spawn(observer.parts, { role: observer.name, target: roomName });
            }
        }
    }
};