module.exports = {
    name: "reserver",
    partConfigs: [
        [CLAIM, CLAIM,  MOVE, MOVE],
        [CLAIM, MOVE]
    ],
    run: function(creep) {
        var target = Game.getObjectById(creep.memory.target);
        if(!target) return;
        
        if(creep.reserveController(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};