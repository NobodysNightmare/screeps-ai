module.exports = {
    moveToRoom: function(creep, roomName) {
        creep.moveTo(new RoomPosition(25, 25, roomName));
    }
};