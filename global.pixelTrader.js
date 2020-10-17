const allowedSalesHistoryDeviation = 0.5;
const minPixelAmount = 100;

module.exports = class PixelTrader {
    constructor() {
    }

    run() {
        if(!Game.resources.pixel) return;
        if(Game.resources.pixel < minPixelAmount) return;

        let bestOrder = _.sortBy(Game.market.getAllOrders({ type: "buy", resourceType: PIXEL }), (o) => -o.price)[0];
        if(!bestOrder) return;

        let history = Game.market.getHistory(PIXEL);
        let lastDay = history[history.length - 1];

        if(!lastDay) return;

        let minPrice = lastDay.avgPrice - (allowedSalesHistoryDeviation * lastDay.stddevPrice);
        if(bestOrder.price >= minPrice) {
            let amount = Math.min(bestOrder.amount, Game.resources.pixel);
            Game.market.deal(bestOrder.id, amount);
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'PixelTrader');
