var spawnHelper = require('helper.spawning');
var logistic = require('helper.logistic');

module.exports = {
    name: "conqueror",
    configs: function() {
        var configs = [];
        for(var parts = 10; parts >= 2; parts -= 1) {
            let config = Array(parts).fill(WORK).concat(Array(parts).fill(CARRY)).concat(Array(parts * 2).fill(MOVE));
            configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        let flag = Game.flags[creep.memory.flag];
        if(creep.room.name != flag.pos.roomName) {
            creep.moveTo(flag.pos);
            return;
        }

        if(creep.room.find(FIND_MY_SPAWNS).length > 0) {
            creep.memory.role = "harvester";
            creep.memory.source = creep.pos.findClosestByRange(FIND_SOURCES).id;
            creep.say("Spawn is there. Becoming a harvester...");
            return;
        }

        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
        }

        if(creep.memory.building) {
            this.constructStructures(creep);
        }
        else {
            this.harvestEnergy(creep);
        }
    },
    constructStructures: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, { filter: (cs) => cs.structureType == STRUCTURE_SPAWN });
        if(target) {
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        return target;
    },
    harvestEnergy: function(creep) {
        let source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        logistic.obtainEnergy(creep, source, true);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'conqueror');
