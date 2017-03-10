const ff = require("helper.friendFoeRecognition");

module.exports = {
    name: "attacker",
    meeleeConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE]
    ],
    run: function(creep) {
        var flag = Game.flags[creep.memory.flag];
        if(creep.pos.roomName == flag.pos.roomName) {
            this.attackRoom(creep);
        } else {
            creep.moveTo(flag);
        }
    },
    attackRoom: function(creep) {
        var target = null;
        if(_.any(creep.body, (p) => p.type == RANGED_ATTACK)) {
            target = ff.findClosestHostileByRange(creep.pos, { filter: (c) => creep.pos.inRangeTo(c, 3) });
        }

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
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER });
        }

        if(target) {
            this.attack(creep, target);
        }
    },
    attack: function(creep, target) {
        let rangedResult = creep.rangedAttack(target);
        let meleeResult = creep.attack(target);
        if(rangedResult == ERR_NOT_IN_RANGE || meleeResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { ignoreDestructibleStructures: true, maxRooms: 0 });
        }
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'attacker');
