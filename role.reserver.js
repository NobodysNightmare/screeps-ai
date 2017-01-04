module.exports = {
    name: "reserver",
    partConfigs: [
        [CLAIM, MOVE]
    ],
    shouldBuild: function(spawn) {
        return false;
    },
    run: function(creep) {
        var targetPos = new RoomPosition(creep.memory.target.x, creep.memory.target.y, creep.memory.target.roomName);
        if(creep.room.name != targetPos.roomName) {
            creep.moveTo(targetPos);
            return;
        }

        if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
};