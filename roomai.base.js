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

const linksService = require("roomservice.links");

module.exports = function(room) {
    var spawns = room.find(FIND_MY_SPAWNS);
    var availableSpawns = _.filter(spawns, (s) => !s.spawning);
    
    return {
        room: room,
        spawns: spawns,
        links: linksService(room),
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
                this.renderSpawnOverlay(spawn);
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
        },
        renderSpawnOverlay: function(spawn) {
            if(spawn.spawning) {
                let role = Game.creeps[spawn.spawning.name].memory.role;
                let remaining = spawn.spawning.remainingTime;
                spawn.room.visual.rect(spawn.pos.x - 1.3, spawn.pos.y + 0.9, 2.6, 0.6,{fill: '#333', opacity: 0.8, stroke: '#fff', strokeWidth: 0.03 });
                spawn.room.visual.text(role, spawn.pos.x - 0.0, spawn.pos.y + 1.3, { align: "center", size: 0.4 });
                spawn.room.visual.circle(spawn.pos, {fill: '#000000', radius: 0.5, opacity: 0.8 });
                spawn.room.visual.text(remaining, spawn.pos.x - 0.0, spawn.pos.y + 0.2, { align: "center", size: 0.6 })
            }
        }
    };
};