const ff = require("helper.friendFoeRecognition");
var spawnHelper = require("helper.spawning");
var defender = require("role.defender");

const keyStructures = [
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION
];

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            this.engageSafeMode();
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
        },
        engageSafeMode: function() {
            let controller = room.controller;
            if(controller.safeMode || controller.upgradeBlocked || controller.level < 5) return;
            if(room.find(FIND_MY_STRUCTURES, { filter: (s) => keyStructures.includes(s.structureType) && (s.hits / s.hitsMax) < 0.95 }).length == 0) return;
            if(ff.findHostiles(room, { filter: (c) => c.owner.username !== "Invader" }).length == 0) return;
            
            controller.activateSafeMode();
            Game.notify("Safe mode engaged in room " + room.name + " (RCL " + controller.level +")");
        }
    }
};