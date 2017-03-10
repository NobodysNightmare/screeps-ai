var spawnHelper = require('helper.spawning');

module.exports = {
    name: "conqueror",
    partConfigs: [
        [WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE]
    ],
    shouldBuild: function(spawn) {
        return false;
    },
    chooseParts: function(room) {
        return spawnHelper.bestAvailableParts(room, this.partConfigs);
    },
    run: function(creep) {
        var targetPos = new RoomPosition(creep.memory.target.x, creep.memory.target.y, creep.memory.target.roomName);
        if(creep.room.name != targetPos.roomName) {
            creep.moveTo(targetPos);
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
        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }

        return source;
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'conqueror');
