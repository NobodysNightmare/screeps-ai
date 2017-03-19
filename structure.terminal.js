const blacklistedResources = [
    RESOURCE_ENERGY,
    RESOURCE_POWER,
    RESOURCE_GHODIUM // allowing for manual import
];

module.exports = function(terminal) {
    return {
        run: function() {
            if(Game.time % 200 != 50) {
                return;
            }
            
            for(var resource in terminal.store) {
                if(!blacklistedResources.includes(resource) && terminal.store[resource] > 100) {
                    this.trade(resource);
                }
            }
        },
        trade: function(resource) {
            var sales = Game.market.getAllOrders((o) => o.type == "sell" && o.resourceType == resource && o.remainingAmount > 100);
            var minPrice = _.min(sales, 'price').price * 0.90;
            var buyers = Game.market.getAllOrders((o) => o.type == "buy" && o.resourceType == resource && o.amount > 0 && o.price >= minPrice);
            buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, terminal.room.name, true));
            buyers = _.sortBy(buyers, (b) => -b.price);
            for(var remainingStore = terminal.store[resource]; remainingStore > 0; ) {
                var buyer = buyers.shift();
                if(!buyer) {
                    break;
                }
                
                var dealAmount = Math.min(remainingStore, buyer.amount);
                var dealCost = Game.market.calcTransactionCost(dealAmount, terminal.room.name, buyer.roomName);
                var energyAvailable = terminal.store[RESOURCE_ENERGY];
                var energyDepleted = false;
                if(dealCost > energyAvailable) {
                    dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
                    energyDepleted = true;
                }
                
                var result = Game.market.deal(buyer.id, dealAmount, terminal.room.name);
                if(result != OK || energyDepleted) {
                    break;
                }
                
                remainingStore -= dealAmount;
            }
        }
    };
};