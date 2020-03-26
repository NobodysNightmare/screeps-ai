module.exports = class TradeLogger {
    constructor() {
        if(!Memory.tradeLogs) {
            Memory.tradeLogs = {
                lastTick: 0,
                players: {}
            }
        }

        this.memory = Memory.tradeLogs;
    }

    logTrades() {
        let lastProcessedTick = 0;

        for(let transaction of Game.market.incomingTransactions) {
            if(transaction.time <= this.memory.lastTick) continue;
            if(lastProcessedTick < transaction.time) lastProcessedTick = transaction.time;

            let sender = transaction.sender && transaction.sender.username;
            if(sender === "NobodysNightmare") continue;

            if(transaction.order) sender = "Market";
            if(!sender) continue;

            if(!this.memory.players[sender]) {
                this.memory.players[sender] = {}
            }

            let current = this.memory.players[sender][transaction.resourceType];
            this.memory.players[sender][transaction.resourceType] = (current || 0) + transaction.amount;
        }

        for(let transaction of Game.market.outgoingTransactions) {
            if(transaction.time <= this.memory.lastTick) continue;
            if(lastProcessedTick < transaction.time) lastProcessedTick = transaction.time;

            let recipient = transaction.recipient && transaction.recipient.username;
            if(recipient === "NobodysNightmare") continue;

            if(transaction.order) recipient = "Market";
            if(!recipient) continue;

            if(!this.memory.players[recipient]) {
                this.memory.players[recipient] = {}
            }

            let current = this.memory.players[recipient][transaction.resourceType];
            this.memory.players[recipient][transaction.resourceType] = (current || 0) - transaction.amount;
        }

        if(lastProcessedTick > this.memory.lastTick) this.memory.lastTick = lastProcessedTick;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'TradeLogger');
