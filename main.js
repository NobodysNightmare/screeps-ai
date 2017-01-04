var roles = [
    require("role.harvester"),
    require("role.upgrader"),
    require("role.builder"),
    require("role.claimer"),
    require("role.reserver")
];

var constructionExtensions = require("construction.extensions");
var constructionRoads = require("construction.roads");
var constructionClaimSpawn = require("construction.claimSpawn");
var spawnRoomService = require("spawn.roomService");
var spawnClaimGroup = require("spawn.claimGroup");
var structureTower = require("structure.tower");

module.exports.loop = function() {
    for(var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        var spawning = spawnRoomService.perform(spawn);
        if(!spawning && spawnName == "Root") {
            spawnClaimGroup.perform(spawn);
        }
    }
    
    for(var role of roles) {
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
        for(var creep of creeps) {
            role.run(creep);
        }
    }
    
    for(var roomName in Game.rooms) {
        var room = Game.rooms[roomName]
        for(var tower of room.find(FIND_MY_STRUCTURES, { filter: (structure) => structure.structureType == STRUCTURE_TOWER })) {
            structureTower.run(tower);
        }
        constructionExtensions.perform(room);
        constructionRoads.perform(room);
    }
    constructionClaimSpawn.perform();

    if(Game.time % 100 == 50) {
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}