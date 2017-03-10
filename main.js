var roles = [
    require("role.harvester"),
    require("role.miner"),
    require("role.upgrader"),
    require("role.builder"),
    require("role.claimer"),
    require("role.conqueror"),
    require("role.reserver"),
    require("role.carrier"),
    require("role.defender"),
    require("role.flagHunter"),
    require("role.attacker"),
    require("role.healer"),
    require("role.hopper"),
    require("role.observer")
];

var constructionClaimSpawn = require("construction.claimSpawn");

var roomAi = require('roomai.base');

const profiler = require('screeps-profiler');
// profiler.enable();

module.exports.loop = function() {
    profiler.wrap(function() {
        for(var role of roles) {
            var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
            for(var creep of creeps) {
                role.run(creep);
            }
        }

        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if(room.controller && room.controller.my) {
                roomAi(room).run();
            }
        }
        constructionClaimSpawn.perform();

        if(Game.time % 100 == 50) {
            for(var name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        }
    });
}
