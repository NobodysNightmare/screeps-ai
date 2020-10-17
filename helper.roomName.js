const roomNameRegex = /^([WE])([0-9]+)([NS])([0-9]+)$/;

module.exports = {
    roomNamesAround: function(roomName, radius) {
        let parsedRoom = this.parse(roomName);
        let result = [];
        for(let r = 1; r <= radius; r++) {
            for(let dx = -r; dx <= r; dx++) {
                for(let dy = -r; dy <= r; dy++) {
                    if(Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

                    result.push(this.offset(parsedRoom, dx, dy));
                }
            }
        }

        return result;
    },
    offset: function(parsedRoom, dx, dy) {
        let room = { ...parsedRoom };
        room.horizontalDistance += dx;
        room.verticalDistance += dy;
        if(room.horizontalDistance < 0) {
            room.horizontalDistance = Math.abs(room.horizontalDistance) - 1;
            room.horizontalDirection = room.horizontalDirection === "W" ? "E" : "W";
        }
        if(room.verticalDistance < 0) {
            room.verticalDistance = Math.abs(room.verticalDistance) - 1;
            room.verticalDirection = room.verticalDirection === "N" ? "S" : "N";
        }

        return `${room.horizontalDirection}${room.horizontalDistance}${room.verticalDirection}${room.verticalDistance}`;
    },
    parse: function(roomName) {
        let match = roomNameRegex.exec(roomName);
        return {
            horizontalDirection: match[1],
            horizontalDistance: Number(match[2]),
            verticalDirection: match[3],
            verticalDistance: Number(match[4])
        };
    }
};

const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roomName');
