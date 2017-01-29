var spawnHelper = require("helper.spawning");
var harvester = require("role.harvester")
var logistic = require('helper.logistic');

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            var primarySpawn = roomai.spawns[0];
            var source = primarySpawn.pos.findClosestByRange(FIND_SOURCES);
            
            this.buildHarvesters(source);
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
        }
    }
};