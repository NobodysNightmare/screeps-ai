const creditReserve = 250000;

module.exports = class TokenTrader {
    constructor() {
    }

    run() {
        let bestOrder = _.sortBy(Game.market.getAllOrders({ type: "sell", resourceType: SUBSCRIPTION_TOKEN }), (o) => o.price)[0];
        let maximumPrice = Game.market.credits - creditReserve;

        if(!bestOrder) return;

        if(bestOrder.price <= maximumPrice) {
            Game.market.deal(bestOrder.id, 1);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'TradeLogger');
