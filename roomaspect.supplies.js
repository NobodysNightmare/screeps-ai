var spawnHelper = require("helper.spawning");
var carrier = require("role.carrier");
var harvester = require("role.harvester");
var miner = require("role.miner");
var logistic = require('helper.logistic');

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            var primarySpawn = roomai.spawns[0];
            var source = primarySpawn.pos.findClosestByRange(FIND_SOURCES);
            
            this.buildHarvesters(source);
            this.buildCollectors();
        },
        buildHarvesters: function(source) {
            var partConfigs = harvester.carryConfigs;
            var neededHarvesters = 1;
            if(!logistic.storeFor(source)) {
                partConfigs = harvester.miningConfigs;
                neededHarvesters = 2;
            }
            
            if(!roomai.canSpawn() || spawnHelper.numberOfCreeps(room, harvester.name) >= neededHarvesters) {
                return;
            }
            
            var parts = null;
            if(spawnHelper.numberOfCreeps(room, harvester.name) == 0) {
                 parts = spawnHelper.bestAffordableParts(room, partConfigs);
            } else {
                 parts = spawnHelper.bestAvailableParts(room, partConfigs);
            }
            
            roomai.spawn(parts, { role: harvester.name, source: source.id });
        },
        buildCollectors: function() {
            var storage = room.storage;
            if(!storage) return;
            
            var sources = room.find(FIND_SOURCES);
    
            // FIXME: ordering duplicated with miners
            sources = _.sortBy(sources, (s) => s.pos.getRangeTo(roomai.spawns[0]));
            
            var existingCollectors = spawnHelper.creepsWithRole(room, carrier.name);
            var existingMiners = spawnHelper.creepsWithRole(room, miner.name);
            for(var source of sources) {
                if(roomai.canSpawn() &&
                    !_.any(existingCollectors, (m) => m.memory.source == source.id && m.memory.destination == storage.id) &&
                    _.any(existingMiners, (m) => m.memory.target == source.id)) {
                    var parts = spawnHelper.bestAffordableParts(room, carrier.configsForCapacity(this.neededCollectorCapacity(source)), true);
                    roomai.spawn(parts, { role: carrier.name, source: source.id, destination: storage.id, resource: RESOURCE_ENERGY });
                }
            }
        },
        neededCollectorCapacity: function(source) {
            // back and forth while 10 energy per tick are generated
            var needed = logistic.distanceByPath(source, room.storage) * 20;
            // adding at least one extra CARRY to make up for inefficiencies
            return needed + 60;
        }
    }
};