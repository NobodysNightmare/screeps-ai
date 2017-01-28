var spawnHelper = require("helper.spawning");
var upgrader = require("role.upgrader");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfCreeps(room, upgrader.name) >= 4) {
                return;
            }
            
            var parts = spawnHelper.bestAvailableParts(room, upgrader.partConfigs);
            roomai.spawn(parts, { role: upgrader.name });
        }
    }
};