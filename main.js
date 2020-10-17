const roles = [
    require("role.harvester"),
    require("role.miner"),
    require("role.linkCollector"),
    require("role.upgrader"),
    require("role.builder"),
    require("role.claimer"),
    require("role.conqueror"),
    require("role.reserver"),
    require("role.carrier"),
    require("role.guard"),
    require("role.defender"),
    require("role.ranger"),
    require("role.reloader"),
    require("role.flagHunter"),
    require("role.attacker"),
    require("role.dismantler"),
    require("role.healer"),
    require("role.hopper"),
    require("role.observer"),
    require("role.trader"),
    require("role.scooper"),
    require("role.powerFarmer"),
    require("role.powerRefiner"),
    require("role.mason"),
    require("role.scientist"),
    require("role.factoryWorker"),
    require("role.nukeOperator"),
    require("role.downgrader"),
];

const powerRoles = [
    require("powerRole.factoryOperator")
];

const ConstructionSitesCleaner = require("cleaner.constructionSites");
const logistic = require("helper.logistic");

const globalStatistics = require("global.statistics");
const profitVisual = require("visual.roomProfit");

const SegmentScanner = require("global.segmentScanner");
const SegmentExport = require("global.segmentExport");
const ShardTravel = require("global.shardTravel");
const TradeLogger = require("global.tradeLogger");
const PixelTrader = require("global.pixelTrader");

global.AbsolutePosition = require("absolutePosition");
global.MapKnowledge = require("mapKnowledge");

require("operation");
require("roomui");

require("patch.controller");
require("patch.creep");
require("patch.powerCreep");
require("patch.room");

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

    for(let roleClass of powerRoles) {
        let creeps = _.filter(Game.powerCreeps, (creep) => creep.memory.role == roleClass.name);
        for(let creep of creeps) {
            let role = new roleClass(creep)
            if(creep.ticksToLive) {
                suppressErrors(() => role.run());
            } else {
                suppressErrors(() => role.runUnspawned());
            }
        }
    }
}

runCreeps = profiler.registerFN(runCreeps, 'Creep Actions');

module.exports.loop = function() {
    profiler.wrap(function() {
        globalStatistics.initialize();
        if(Memory.lastCompletedTick < Game.time - 1) {
            Memory.stats.skippedTicks += 1;
        }

        if(Game.time % 10 === 0 && Game.cpu.bucket < 3000) {
            console.log("Bucket at " + Game.cpu.bucket);
        }

        if(Game.time % 100 == 50) {
            for(let name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
        }

        if(Game.time % 10000 === 0) {
            logistic.cleanupCaches();
        }

        suppressErrors(() => ShardTravel.loadArrivals());
        runCreeps();
        suppressErrors(() => ShardTravel.announceDepartures());

        suppressErrors(() => MapKnowledge.updateKnowledge());

        if(Game.cpu.bucket < 1000 && Game.time % 2 === 0) return;

        suppressErrors(() => new SegmentScanner().run());

        for(let operation of Operation.operations) {
            suppressErrors(() => operation.run());
        }

        for(let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if(room.ai()) {
                suppressErrors(() => room.ai().run());
            }
        }

        new ConstructionSitesCleaner().run();

        suppressErrors(() => new TradeLogger().logTrades());
        suppressErrors(() => new PixelTrader().run());

        for(let operation of Operation.operations) {
            suppressErrors(() => operation.drawVisuals());
        }

        suppressErrors(() => new SegmentExport().run());

        for(let ui of RoomUI.all) {
            suppressErrors(() => ui.render());
        }

        if(Game.cpu.bucket >= 9999 && Game.cpu.generatePixel) {
            Game.cpu.generatePixel();
        }

        globalStatistics.run();
        profitVisual.run();

        RawMemory.setActiveSegments([98, 99]);
        RawMemory.setPublicSegments([98]);
        RawMemory.setDefaultPublicSegment(98);

        Memory.lastCompletedTick = Game.time;
    });
}
