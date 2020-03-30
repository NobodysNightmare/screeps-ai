/*
Exports trades to public segment

    basicTrading: {
        room: "E1S1",
        energy: true,
        X: false,
        ...
    },
    advancedTrading: {
        E1S1: {
            energy: 100,
            ...
        },
        ...
    }

Basic trading is a polyfill from advanced trading
*/

const announcedResources = ["energy", "O", "H", "L", "U", "K", "Z", "X"];

module.exports = class SegmentTrading {
    constructor() {
    }

    run() {
        let result = { advancedTrading: {} };
        let rooms = _.filter(Game.rooms, (r) => r.ai() && r.ai().trading.isTradingPossible());

        for(let room of rooms) {
            let roomRequest = {};
            for(let resource of announcedResources) {
                let request = room.ai().trading.requiredImportToRoom(resource);
                if(request > 0) roomRequest[resource] = request;
            }

            if(_.sum(roomRequest) > 0) result.advancedTrading[room.name] = roomRequest;
        }

        // TODO: improve polyfill to select "good" room (or collect more requests)
        result.basicTrading = {};
        let polyfillRoom = Object.keys(result.advancedTrading)[0];
        if(polyfillRoom) {
            let polyfillData = result.advancedTrading[polyfillRoom];
            result.basicTrading.room = polyfillRoom;
            for(let resource in polyfillData) {
                result.basicTrading[resource] = true;
            }
        }

        return result;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentTradingExport');
