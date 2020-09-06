/*
Exports trades to public segment

    basicTrading: {
        room: "E1S1",
        energy: true,
        X: false,
        ...
    },
    "advancedTrading": {
        "W6S9": [
          {
            "resource": "XGHO2",
            "priority": 1
          },
          ...
        ]
      }
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
            let roomRequests = [];
            for(let resource of announcedResources) {
                let request = room.ai().trading.requiredImportToRoom(resource);
                if(request > 0) roomRequests.push({ resource: resource, amount: request, priority: 0.5 });
            }

            if(roomRequests.length > 0) result.advancedTrading[room.name] = roomRequests;
        }

        // polyfilling basicTrading: collecting requests from all the rooms and routing
        // them to one room (randomly selecting that, so incoming resources are spread)
        result.basicTrading = {};
        let polyfillRoom = _.sample(Object.keys(result.advancedTrading));
        let polyfillResources = _.uniq(_.flatten(_.map(result.advancedTrading, (requests) => _.map(requests, (r) => r.resource))));
        if(polyfillRoom) {
            result.basicTrading.room = polyfillRoom;
            for(let resource of polyfillResources) {
                result.basicTrading[resource] = true;
            }
        }

        return result;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentTradingExport');
