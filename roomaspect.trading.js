const spawnHelper = require("helper.spawning");
const trader = require("role.trader");

const trading = require("helper.trading");

module.exports = class TradingAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.storage = this.room.storage;
        this.terminal = this.room.terminal;
    }

    run() {
        if(!this.storage || !this.terminal) return;
        this.transferExcessResource();
        this.buildTrader();
    }

    transferExcessResource() {
        for(var resource in this.terminal.store) {
            let amountInTerminal = this.terminal.store[resource];
            let amountInStorage = this.storage.store[resource] || 0;
            if(!trading.blacklistedResources.includes(resource)) {
                let excessAmount = amountInTerminal + amountInStorage - trading.baselineAmount;
                let sendableAmount = _.min([amountInTerminal, excessAmount]);
                if(sendableAmount >= 100) {
                    if(this.balanceToEmpire(resource, sendableAmount)) {
                        return;
                    } else {
                        if(Game.time % 200 === 50) return this.sell(resource, sendableAmount);
                    }
                }
            }
        }
    }

    balanceToEmpire(resource, amount) {
        let targets = _.map(_.filter(Game.rooms, (r) => r.controller && r.controller.my && r.terminal && r.storage), (r) => ({ room: r, miss: trading.baselineAmount - ((r.terminal.store[resource] || 0) + (r.storage.store[resource] || 0)) }));
        let choice = _.sortBy(_.filter(targets, (t) => t.miss > 0), (t) => -t.miss)[0];
        if(choice) {
            this.terminal.send(resource, _.min([amount, _.max([100, choice.miss])]), choice.room.name, "empire balancing");
            return true;
        }

        return false;
    }

    sell(resource, amount) {
        amount = _.min([amount, this.terminal.store[resource]]);
        if(amount < 100) return;
        let sales = Game.market.getAllOrders((o) => o.type == "sell" && o.resourceType == resource && o.remainingAmount > 100);
        let minPrice = _.min(sales, 'price').price * 0.90;
        let buyers = Game.market.getAllOrders((o) => o.type == "buy" && o.resourceType == resource && o.amount > 0 && o.price >= minPrice);
        buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, this.room.name, true));
        buyers = _.sortBy(buyers, (b) => -b.price);
        for(let remainingStore = amount; remainingStore > 0; ) {
            var buyer = buyers.shift();
            if(!buyer) {
                break;
            }

            let dealAmount = Math.min(remainingStore, buyer.amount);
            let dealCost = Game.market.calcTransactionCost(dealAmount, this.room.name, buyer.roomName);
            let energyAvailable = this.terminal.store[RESOURCE_ENERGY];
            let energyDepleted = false;
            if(dealCost > energyAvailable) {
                dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
                energyDepleted = true;
            }

            let result = Game.market.deal(buyer.id, dealAmount, this.room.name);
            if(result != OK || energyDepleted) {
                break;
            }

            remainingStore -= dealAmount;
        }
    }

    buildTrader() {
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, trader.name) >= 1) return;
        if(trading.findExportableResource(this.room) || trading.findImportableResource(this.room)) {
            this.roomai.spawn(trader.parts, { role: trader.name });
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'TradingAspect');
