var constructions = [
    require("construction.extensions"),
    require("construction.extractor"),
    require("construction.ramparts"),
    require("construction.roads")
];

var spawnRoomService = require("spawn.roomService");
var spawnClaimGroup = require("spawn.claimGroup");
var structureTower = require("structure.tower");
var structureTerminal = require("structure.terminal");

module.exports = function(room) {
    var spawns = room.find(FIND_MY_SPAWNS);
    
    return {
        room: room,
        run: function() {
            for(var spawn of spawns) {
                var spawning = spawnRoomService.perform(spawn);
                if(!spawning && spawn.name == "Root") {
                    spawnClaimGroup.perform(spawn);
                }
            }
            
            for(var tower of room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER })) {
                structureTower.run(tower);
            }
            
            if(room.terminal) {
                structureTerminal(room.terminal).run();
            }
            
            for(var construction of constructions) {
                construction.perform(room);
            }
        },
        spawn: function(parts, memory) {
            var spawn = this.availableSpawns()[0];
            if(!spawn) {
                return false;
            }
            
            return spawn.createCreep(parts, undefined, memory);
        },
        canSpawn: function() {
            return this.availableSpawns().length > 0;
        },
        availableSpawns: function() {
            return _.filter(spawns, (s) => s.spawning);
        }
    };
};