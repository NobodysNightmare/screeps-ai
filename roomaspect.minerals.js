var container = require("construction.containers");
var spawnHelper = require("helper.spawning");
var miner = require("role.miner");

module.exports = function(roomai) {
    var room = roomai.room;
    return {
        run: function() {
            if(!room.controller || room.controller.level < 6) {
                return;
            }
            
            this.buildMiner();
            this.buildStructures();
        },
        buildMiner: function() {
            var mineral = room.find(FIND_MINERALS)[0];
            if(!roomai.canSpawn() ||
                mineral.mineralAmount == 0 ||
                spawnHelper.numberOfCreeps(room, miner.name) > 0 ||
                room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_EXTRACTOR }).length == 0) {
                return;
            }
            
            var parts = spawnHelper.bestAvailableParts(room, miner.partConfigs);
            var memory = {
                role: miner.name,
                target: mineral.id,
                resource: mineral.mineralType
            };
            
            roomai.spawn(parts, memory);
        },
        buildStructures: function() {
            if(Game.time % 20 != 0) {
                return;
            }
            
            for(var mineral of room.find(FIND_MINERALS)) {
                room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
                container.buildNear(mineral);
            }
        }
    }
};