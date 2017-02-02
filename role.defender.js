module.exports = {
    name: "defender",
    meeleeConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE],
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};