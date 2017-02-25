var spawnHelper = require("helper.spawning");
var builder = require("role.builder");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(roomai, builder.name) >= 2) {
                return;
            }

            var parts = spawnHelper.bestAvailableParts(room, builder.partConfigs);
            roomai.spawn(parts, { role: builder.name });
        }
    }
};
