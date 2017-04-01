const roles = [
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
    require("role.observer"),
    require("role.scooper"),
    require("role.powerFarmer"),
    require("role.mason")
];

const constructionClaimSpawn = require("construction.claimSpawn");

const RoomAI = require('roomai.base');
const statsVisual = require("visual.globalStatistics");
const profitVisual = require("visual.roomProfit");

require("traveler");

const profiler = require('screeps-profiler');
profiler.enable();

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
                new RoomAI(room).run();
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

        statsVisual.run();
        profitVisual.run();
    });
}
