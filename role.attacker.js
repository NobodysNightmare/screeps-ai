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
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_TOWER });
        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
        }
        
        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        }
        
        if(!target) {
            target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER });
        }
        
        if(target) {
            this.attack(creep, target);
        }
    },
    attack: function(creep, target) {
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};