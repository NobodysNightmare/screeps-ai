module.exports = {
    name: "flagHunter",
    partConfigs: [
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE]
    ],
    run: function(creep) {
        var target = Game.flags[creep.memory.flag];
        creep.moveTo(target);
    }
};