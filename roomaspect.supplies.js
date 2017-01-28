var spawnHelper = require("helper.spawning");
var harvester = require("role.harvester")

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfCreeps(room, harvester.name) >= 2) {
                return;
            }
            
            var parts = null;
            if(spawnHelper.numberOfCreeps(room, harvester.name) == 0) {
                 parts = spawnHelper.bestAffordableParts(room, harvester.partConfigs);
            } else {
                 parts = spawnHelper.bestAvailableParts(room, harvester.partConfigs);
            }
            
            roomai.spawn(parts, { role: harvester.name });
        }
    }
};