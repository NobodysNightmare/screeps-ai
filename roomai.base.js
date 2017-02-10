var constructions = [
    require("construction.extensions"),
    require("construction.extractor"),
    require("construction.ramparts"),
    require("construction.roads")
];

var aspects = [
    require("roomaspect.supplies"),
    require("roomaspect.sources"),
    require("roomaspect.defense"),
    require("roomaspect.controller"),
    require("roomaspect.builders"),
    require("roomaspect.minerals"),
    require("roomaspect.remoteMines")
];

var spawnClaimGroup = require("spawn.claimGroup");
var structureTower = require("structure.tower");
var structureTerminal = require("structure.terminal");

module.exports = function(room) {
    var spawns = room.find(FIND_MY_SPAWNS);
    var availableSpawns = _.filter(spawns, (s) => !s.spawning);
    
    return {
        room: room,
        spawns: spawns,
        run: function() {
            for(var aspect of aspects) {
                aspect(this).run();
            }
            
            // TODO: convert to aspect
            var rootSpawn = Game.spawns["Root"];
            if(rootSpawn) {
                spawnClaimGroup.perform(rootSpawn);
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
            
            for(var spawn of spawns) {
                if(spawn.spawning) {
                    var role = Game.creeps[spawn.spawning.name].memory.role;
                    var remaining = spawn.spawning.remainingTime;
                    room.visual.text(role + " (" + remaining + ")", spawn.pos.x + 0.5, spawn.pos.y + 0.5, { align: "left", size: 0.6 })
                }
            }
        },
        spawn: function(parts, memory) {
            var spawn = availableSpawns[0];
            if(!spawn || this.spawnReserved) {
                return false;
            }
            
            var result = spawn.createCreep(parts, undefined, memory);
            if(_.isString(result)) {
                availableSpawns.shift();
            } else if(result == ERR_NOT_ENOUGH_ENERGY) {
                this.spawnReserved = true;
            }
            
            return result;
        },
        canSpawn: function() {
            return !this.spawnReserved && availableSpawns.length > 0;
        }
    };
};