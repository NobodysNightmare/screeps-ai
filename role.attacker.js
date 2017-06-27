const boosting = require("helper.boosting");
const ff = require("helper.friendFoeRecognition");
const movement = require("helper.movement");

module.exports = {
    name: "attacker",
    meleeConfigs: function(options) {
        options = options || {};
        var configs = [];
        for(var attack = (options.maxAttack || 25); attack >= (options.minAttack || 1); attack -= 1) {
            let config = Array(attack).fill(ATTACK).concat(Array(attack).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    run: function(creep) {
        if(boosting.accept(creep, "XUH2O")) return;
        
        var flag = Game.flags[creep.memory.flag];
        if(creep.pos.roomName == flag.pos.roomName) {
            this.attackRoom(creep);
        } else {
            this.approachRoom(creep, flag.pos.roomName);
        }
    },
    approachRoom: function(creep, roomName) {
        movement.moveToRoom(creep, roomName);
        let target = ff.findClosestHostileByRange(creep.pos);
        if(target && creep.pos.isNearTo(target)) {
            creep.attack(target);
        }
    },
    attackRoom: function(creep) {
        var target = null;

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER });
        }

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
        }

        if(!target) {
            target = ff.findClosestHostileByRange(creep.pos);
        }

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER && s.structureType != STRUCTURE_STORAGE });
        }

        if(target) {
            this.attack(creep, target);
        } else {
            this.aggressiveMove(creep, Game.flags[creep.memory.flag]);
        }
    },
    attack: function(creep, target) {
        let result = creep.attack(target);
        if(result == ERR_NOT_IN_RANGE) {
            this.aggressiveMove(creep, target);
        }
    },
    aggressiveMove: function(creep, target) {
        creep.moveTo(target, { ignoreDestructibleStructures: true, maxRooms: 1 });
        if(creep.memory._move.path) {
            let nextStep = Room.deserializePath(creep.memory._move.path)[0];
            let moveTarget = _.find(creep.room.lookForAt(LOOK_STRUCTURES, creep.room.getPositionAt(nextStep.x, nextStep.y)), (s) => s.structureType == STRUCTURE_WALL || ff.isHostile(s));
            if(!moveTarget) {
                moveTarget = _.find(creep.room.lookForAt(LOOK_CREEPS, creep.room.getPositionAt(nextStep.x, nextStep.y)), (c) => ff.isHostile(c));
            }
            
            if(moveTarget) {
                creep.attack(moveTarget);
            }
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'attacker');
