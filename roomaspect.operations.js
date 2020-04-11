module.exports = class OperationsAspect {
    constructor(roomai) {
        this.room = roomai.room;
    }

    run() {
        for(let operation of Operation.forSupportRoom(this.room)) {
            operation.supportRoomCallback(this.room);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'OperationsAspect');
