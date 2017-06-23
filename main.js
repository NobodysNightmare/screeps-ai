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
    require("role.reloader"),
    require("role.flagHunter"),
    require("role.attacker"),
    require("role.healer"),
    require("role.hopper"),
    require("role.observer"),
    require("role.trader"),
    require("role.scooper"),
    require("role.powerFarmer"),
    require("role.powerRefiner"),
    require("role.mason"),
    require("role.scientist"),
    require("role.nukeOperator"),
    require("role.downgrader"),
];

const statsVisual = require("visual.globalStatistics");
const profitVisual = require("visual.roomProfit");

require("patch.room");
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
    for(let role of roles) {
        let creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.name && creep.ticksToLive !== undefined);
        for(let creep of creeps) {
            suppressErrors(() => role.run(creep));
        }
    }
}

runCreeps = profiler.registerFN(runCreeps, 'Creep Actions');

module.exports.loop = function() {
    profiler.wrap(function() {
        if(Game.time % 10 === 0 && Game.cpu.bucket < 5000) {
            console.log("Bucket at " + Game.cpu.bucket);
        }
        
        if(Game.time % 100 == 50) {
            for(let name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        }
        
        runCreeps();
        
        if(Game.cpu.bucket < 1000 && Game.time % 2 === 0) return;

        for(let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if(room.ai()) {
                suppressErrors(() => room.ai().run());
            }
        }

        statsVisual.run();
        profitVisual.run();
    });
}
