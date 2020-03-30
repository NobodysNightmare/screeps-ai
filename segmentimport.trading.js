/*
Imports trades from shared segments

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

And maps them into a local memory structure for access by remaining code:

    Memory.tradeRequests = {
        energy: [
            { username: "Foo", room: "E1S1", amount: 100 },
            ...
        ],
        ...
    }
*/

module.exports = class SegmentTrading {
    constructor(data, username) {
        this.basicTrades = data.basicTrading;
        this.advancedTrades = data.advancedTrading;
        this.username = username;

        if(!Memory.tradeRequests) {
            Memory.tradeRequests = {};
        }

        this.tradeRequests = Memory.tradeRequests;
    }

    run() {
        this.clearExistingRequests();
        this.importAdvancedTrades();
        this.importBasicTrades();
    }

    clearExistingRequests() {
        for(let resource in this.tradeRequests) {
            this.tradeRequests[resource] = _.filter(this.tradeRequests[resource], (r) => r.username !== this.username);
        }
    }

    importAdvancedTrades() {
        if(!this.advancedTrades) return;

        // TODO: more error handling for unexpected format?
        for(let room in this.advancedTrades) {
            let roomRequests = this.advancedTrades[room];
            for(let resource in roomRequests) {
                this.addTradeRequest(resource, roomRequests[resource], room);
            }
        }
    }

    importBasicTrades() {
        if(!(this.basicTrades && this.basicTrades.room)) return;

        for(let resource in this.basicTrades) {
            if(resource === "room") continue;

            if(this.basicTrades[resource]) {
                this.addTradeRequest(resource, 250, this.basicTrades.room);
            }
        }
    }

    addTradeRequest(resource, amount, room) {
        if(!this.tradeRequests[resource]) {
            this.tradeRequests[resource] = [];
        }

        this.tradeRequests[resource].push({
            username: this.username,
            room: room,
            amount: amount
        });
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'SegmentTrading');
