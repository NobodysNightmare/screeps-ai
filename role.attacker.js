const boosting = require("helper.boosting");
const ff = require("helper.friendFoeRecognition");
const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

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
    toughConfig: function(toughness) {
      return spawnHelper.makeParts(toughness, TOUGH, 40 - toughness, ATTACK, 10, MOVE);
    },
    run: function(creep) {
        if(creep.body[0].type === TOUGH) {
            if(boosting.accept(creep, "XZHO2", "XUH2O", "XGHO2")) return;
        } else {
            if(boosting.accept(creep, "XUH2O")) return;
        }

        var flag = Game.flags[creep.memory.flag];
        if(!flag) return;
        
        if(creep.pos.roomName == flag.pos.roomName) {
            this.attackRoom(creep);
        } else {
            this.approachRoom(creep, flag.pos.roomName);
        }
    },
    approachRoom: function(creep, roomName) {
        if(!this.shouldWait(creep)) {
            movement.moveToRoom(creep, roomName);
        }

        let target = ff.findClosestHostileByRange(creep.pos);
        if(target && creep.pos.isNearTo(target)) {
            creep.attack(target);
        }
    },
    attackRoom: function(creep) {
        let target = Game.flags[creep.memory.flag].pos.lookFor(LOOK_STRUCTURES)[0];

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
        }

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER });
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
        if(this.shouldWait(creep)) return;

        if(creep.moveTo(target, { maxRooms: 1 }) === ERR_NO_PATH) {
            creep.moveTo(target, { ignoreDestructibleStructures: true, maxRooms: 1 });
        }

        if(creep.memory._move.path) {
            let nextStep = Room.deserializePath(creep.memory._move.path)[0];
            let moveTarget = _.find(creep.room.lookForAt(LOOK_STRUCTURES, creep.room.getPositionAt(nextStep.x, nextStep.y)), (s) => s.structureType === STRUCTURE_WALL || ff.isHostile(s));
            if(!moveTarget) {
                moveTarget = _.find(creep.room.lookForAt(LOOK_CREEPS, creep.room.getPositionAt(nextStep.x, nextStep.y)), (c) => ff.isHostile(c));
            }

            if(!moveTarget) {
                let closeHostiles = _.filter(ff.findHostiles(creep.room), (c) => c.pos.isNearTo(creep));
                moveTarget = closeHostiles[0];
            }

            if(moveTarget) {
                creep.attack(moveTarget);
            }
        }
    },
    shouldWait: function(creep) {
        if(movement.isOnExit(creep)) return false;

        if(creep.room.controller && creep.room.controller.my) {
            // automatically rally close to the room border
            if(movement.isWithin(creep, 5, 5, 45, 45)) return false;
        }

        if(creep.memory.waitFor === true) {
            console.log("Attacker " + creep.name + " waiting for follower to be spawned. (" + creep.room.name + ")");
            return true;
        }
        
        let waitFor = Game.creeps[creep.memory.waitFor];
        if(!waitFor) return false;

        return !creep.pos.isNearTo(waitFor);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'attacker');
