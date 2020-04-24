const boosting = require("helper.boosting");
const ff = require("helper.friendFoeRecognition");
const movement = require("helper.movement");
const spawnHelper = require("helper.spawning");

const prioritizedStructures = [STRUCTURE_SPAWN, STRUCTURE_TOWER];
const blacklistedStructures = [STRUCTURE_STORAGE];

module.exports = {
    name: "dismantler",
    mainBoost: "XZH2O",
    configs: function(options) {
        options = options || {};
        var configs = [];
        for(let force = 25; force >= 5; force -= 1) {
            let config = Array(force).fill(WORK).concat(Array(force).fill(MOVE));
            if(config.length <= 50) configs.push(config);
        }

        return configs;
    },
    toughConfig: function(toughness) {
      return spawnHelper.makeParts(toughness, TOUGH, 40 - toughness, WORK, 10, MOVE);
    },
    run: function(creep) {
        if(creep.ticksToLive == CREEP_LIFE_TIME - 1) creep.notifyWhenAttacked(false);

        if(creep.body[0].type === TOUGH) {
            if(boosting.accept(creep, "XZHO2", "XZH2O", "XGHO2")) return;
        } else {
            if(boosting.accept(creep, "XZH2O")) return;
        }

        let target = AbsolutePosition.deserialize(creep.memory.target);

        if(creep.pos.roomName == target.roomName) {
            this.attackRoom(creep, target);
        } else {
            this.approachRoom(creep, target);
        }
    },
    approachRoom: function(creep, position) {
        if(!this.shouldWait(creep)) {
            creep.goTo(position);
        }
    },
    attackRoom: function(creep, position) {
        let target = position.pos.lookFor(LOOK_STRUCTURES)[0];

        for(let structureType of prioritizedStructures) {
            if(target) break;
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType == structureType });
        }

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && !blacklistedStructures.includes(s.structureType) });
        }

        if(!target) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.structureType !== STRUCTURE_CONTROLLER && !blacklistedStructures.includes(s.structureType) });
        }

        if(target) {
            this.attack(creep, target);
        } else {
            this.aggressiveMove(creep, position);
        }
    },
    attack: function(creep, target) {
        let result = creep.dismantle(target);
        if(result == ERR_NOT_IN_RANGE) {
            if(!this.aggressiveMove(creep, target)) {
                let temporaryTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER });
                if(creep.pos.isNearTo(temporaryTarget)) {
                    creep.dismantle(temporaryTarget);
                }
            }
        }
    },
    aggressiveMove: function(creep, target) {
        if(this.shouldWait(creep)) return false;

        if(creep.moveTo(target, { maxRooms: 1, reusePath: CREEP_LIFE_TIME }) === ERR_NO_PATH) {
            creep.moveTo(target, { ignoreDestructibleStructures: true, maxRooms: 1, reusePath: CREEP_LIFE_TIME });
        }

        if(creep.memory._move.path) {
            let nextStep = Room.deserializePath(creep.memory._move.path)[0];
            let moveTarget = _.find(creep.room.lookForAt(LOOK_STRUCTURES, creep.room.getPositionAt(nextStep.x, nextStep.y)), (s) => s.structureType == STRUCTURE_WALL || ff.isHostile(s));

            if(moveTarget) {
                creep.dismantle(moveTarget);
                return true;
            }
        }

        return false;
    },
    shouldWait: function(creep) {
        if(movement.isOnExit(creep)) return false;

        if(creep.room.controller && creep.room.controller.my) {
            // automatically rally close to the room border
            if(movement.isWithin(creep, 5, 5, 45, 45)) return false;
        }

        if(creep.memory.waitFor === true) {
            console.log("Dismantler " + creep.name + " waiting for follower to be spawned. (" + creep.room.name + ")");
            return true;
        }

        let waitFor = Game.creeps[creep.memory.waitFor];
        if(!waitFor) return false;

        return !creep.pos.isNearTo(waitFor);
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'dismantler');
