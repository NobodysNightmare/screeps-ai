var spawnHelper = require("helper.spawning");
var harvester = require("role.harvester")
var logistic = require('helper.logistic');

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfCreeps(room, harvester.name) >= 2) {
                return;
            }
            
            var primarySpawn = roomai.spawns[0];
            var source = primarySpawn.pos.findClosestByRange(FIND_SOURCES);
            
            this.buildHarvester(source);
        },
        buildHarvester: function(source) {
            var partConfigs = harvester.carryConfigs;
            if(!logistic.storeFor(source)) {
                partConfigs = harvester.miningConfigs;
            }
            
            var parts = null;
            if(spawnHelper.numberOfCreeps(room, harvester.name) == 0) {
                 parts = spawnHelper.bestAffordableParts(room, partConfigs);
            } else {
                 parts = spawnHelper.bestAvailableParts(room, partConfigs);
            }
            
            // TODO: make harvesters farm the given source
            roomai.spawn(parts, { role: harvester.name, source: source.id });
        }
    }
};