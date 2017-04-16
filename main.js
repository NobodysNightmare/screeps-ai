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
    require("role.trader"),
    require("role.scooper"),
    require("role.powerFarmer"),
    require("role.powerRefiner"),
    require("role.mason")
];

const constructionClaimSpawn = require("construction.claimSpawn");

const RoomAI = require('roomai.base');
const statsVisual = require("visual.globalStatistics");
const profitVisual = require("visual.roomProfit");

require("traveler");

const profiler = require('screeps-profiler');
profiler.enable();

function suppressErrors(callback) {
    try {
        callback();
    } catch(error) {
        console.log('<span style="color: #faa">' + error.stack + '</span>');
    }
}

function runCreeps() {
    for(var role of roles) {
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.name);
        for(var creep of creeps) {
            suppressErrors(() => role.run(creep));
        }
    }
}

runCreeps = profiler.registerFN(runCreeps, 'Creep Actions');

module.exports.loop = function() {
    profiler.wrap(function() {
        runCreeps();

        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if(room.controller && room.controller.my) {
                suppressErrors(() => new RoomAI(room).run());
            }
        }
        constructionClaimSpawn.perform(); // TODO: move into claim operation

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
