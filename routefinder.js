module.exports = class RouteFinder {
    constructor(startRoom, destinationRoom) {
        this.startRoom = startRoom;
        this.destinationRoom = destinationRoom;
    }

    findRoute() {
        let allowedRooms = _.map(Game.map.findRoute(this.startRoom, this.destinationRoom), (i) => i.room);
        return _.uniq(allowedRooms.concat([this.startRoom, this.destinationRoom]));
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'RouteFinder');
