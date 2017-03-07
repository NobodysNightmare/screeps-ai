const ff = require("helper.friendFoeRecognition");
var spawnHelper = require("helper.spawning");
var defender = require("role.defender");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            var primaryHostile = Game.getObjectById(room.memory.primaryHostile);
            
            if(!primaryHostile || primaryHostile.pos.roomName != room.name) {
                primaryHostile = null;
                var hostiles = ff.findHostiles(room);
                if(hostiles.length > 0) {
                    primaryHostile = hostiles[0];
                }
                
                room.memory.primaryHostile = primaryHostile && primaryHostile.id;
            }
            
            if(!roomai.canSpawn() || !primaryHostile) {
                return;
            }
            
            var parts = spawnHelper.bestAffordableParts(room, defender.meeleeConfigs, true);
            roomai.spawn(parts, { role: defender.name, room: room.name, originRoom: room.name });
        }
    }
};