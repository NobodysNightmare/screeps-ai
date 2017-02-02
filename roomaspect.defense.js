var spawnHelper = require("helper.spawning");
var defender = require("role.defender");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!roomai.canSpawn() || room.find(FIND_HOSTILE_CREEPS).length == 0) {
                return;
            }
            
            var parts = spawnHelper.bestAffordableParts(room, defender.meeleeConfigs);
            roomai.spawn(parts, { role: defender.name });
        }
    }
};