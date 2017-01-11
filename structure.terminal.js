module.exports = function(terminal) {
    return {
        run: function() {
            if(Game.time % 200 != 50) {
                return;
            }
            
            for(var resource in terminal.store) {
                if(resource != RESOURCE_ENERGY && terminal.store[resource] > 100) {
                    this.trade(resource);
                }
            }
        },
        trade: function(resource) {
            var sales = Game.market.getAllOrders((o) => o.type == "sell" && o.resourceType == resource && o.remainingAmount > 100);
            var minPrice = Math.max(0.75, _.min(sales, 'price').price * 0.90); // TODO: 0.75 is a development safeguard
            var buyers = Game.market.getAllOrders((o) => o.type == "buy" && o.resourceType == resource && o.amount > 0 && o.price >= minPrice);
            buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, terminal.room.name, true));
            buyers = _.sortBy(buyers, (b) => -b.price);
            for(var remainingStore = terminal.store[resource]; remainingStore > 0; ) {
                var buyer = buyers.shift();
                if(!buyer) {
                    break;
                }
                
                var dealAmount = Math.min(remainingStore, buyer.amount);
                var result = Game.market.deal(buyer.id, dealAmount, terminal.room.name);
                if(result != OK) {
                    break;
                }
                
                remainingStore -= dealAmount;
            }
        }
    };
};