var spawnHelper = require("helper.spawning");
var carrier = require("role.carrier");
var harvester = require("role.harvester");
var linkCollector = require("role.linkCollector");
var miner = require("role.miner");
var logistic = require('helper.logistic');

module.exports = function(roomai) {
    var room = roomai.room;
    var linksEnabled = room.storage && roomai.links.storage();
    return {
        run: function() {
            var primarySpawn = roomai.spawns[0];
            if(!primarySpawn) return;

            var source = primarySpawn.pos.findClosestByRange(FIND_SOURCES);

            this.buildHarvesters(source);

            if(linksEnabled) {
                let collector = spawnHelper.localCreepsWithRole(roomai, linkCollector.name)[0];
                if(collector) {
                    this.runLinkCollector(collector);
                } else {
                    this.buildLinkCollector();
                }

                this.runLinks();
            }

            this.buildCollectors();
        },
        buildHarvesters: function(source) {
            var partConfigs = harvester.carryConfigs;
            var neededHarvesters = 1;
            if(!logistic.storeFor(source) && !(room.storage && room.storage.store.energy)) {
                partConfigs = harvester.miningConfigs;
                neededHarvesters = 2;
            }

            if(!roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(roomai, harvester.name) >= neededHarvesters) {
                return;
            }

            var parts = null;
            if(spawnHelper.numberOfLocalCreeps(roomai, harvester.name) == 0) {
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

            var existingCollectors = spawnHelper.localCreepsWithRole(roomai, carrier.name);
            var existingMiners = spawnHelper.localCreepsWithRole(roomai, miner.name);
            for(var source of sources) {
                if(roomai.canSpawn() &&
                    !_.any(existingCollectors, (m) => m.memory.source == source.id && m.memory.destination == storage.id) &&
                    (!linksEnabled || !roomai.links.linkAt(source)) &&
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
        },
        runLinkCollector: function(creep) {
            if(creep.carry.energy == 0) {
                if(creep.withdraw(roomai.links.storage(), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(roomai.links.storage());
                }
            }
            // TODO: withdraw + transfer in one step
            if(creep.carry.energy > 0){
                if(creep.transfer(room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(room.storage);
                }
            }
        },
        buildLinkCollector: function() {
            if(!roomai.canSpawn()) {
                return;
            }

            roomai.spawn(linkCollector.parts, { role: linkCollector.name });
        },
        runLinks: function() {
            for(var link of roomai.links.sources()) {
                if(link.energy / link.energyCapacity >= 0.5) {
                    link.transferEnergy(roomai.links.storage());
                }
            }
        }
    }
};
