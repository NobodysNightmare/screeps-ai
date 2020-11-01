const spawnHelper = require("helper.spawning");
const trader = require("role.trader");

const MAX_TRANSFER = 20000;
const TERMINAL_MAX_FILL = 270000;

const allowedSalesHistoryDeviation = 0.5;
const allowedBuySellPriceRatio = 0.9;

const npcRoomRegex = /^[WE][0-9]*0[NS][0-9]*0$/;

class DemandCache {
    constructor(demandCallback) {
        this.demandCallback = demandCallback;
        this.resources = {};
        this.currentTick = 0;
    }

    // returns an object with :room and :miss, indicating which rooms needs
    // the resource next and how many.
    chooseRecipient(resource) {
        this.ensureValidCache();
        let targets = this.resources[resource];
        if(!targets) {
            targets = _.map(_.filter(Game.rooms, (r) => r.ai() && r.ai().trading.isTradingPossible() && _.sum(r.terminal.store) < TERMINAL_MAX_FILL), (r) => ({ room: r, miss: this.demandCallback(r.ai(), resource) }));
            this.resources[resource] = targets;
            targets = this.updateTargetList(resource);
        }

        return targets[0];
    }

    reduceMiss(room, resource, amount) {
        let targets = this.resources[resource];
        if(!targets) return;

        let target = _.find(targets, (t) => t.room === room);
        if(target) {
            target.miss -= amount;
            this.updateTargetList(resource);
        }
    }

    ensureValidCache() {
        if(Game.time !== this.currentTick) {
            this.resources = {};
            this.currentTick = Game.time;
        }
    }

    updateTargetList(resource) {
        this.resources[resource] = _.sortBy(_.filter(this.resources[resource], (t) => t.miss > 0), (t) => -t.miss);
        return this.resources[resource];
    }
}

const possibleImportCache = new DemandCache((ai, resource) => ai.trading.possibleImportToRoom(resource));
const requiredImportCache = new DemandCache((ai, resource) => ai.trading.requiredImportToRoom(resource));

module.exports = class TradingAspect {
    constructor(roomai) {
        this.roomai = roomai;
        this.room = roomai.room;
        this.storage = this.room.storage;
        this.terminal = this.room.terminal;
        this.trading = roomai.trading;
    }

    run() {
        if(!this.trading.isTradingPossible()) return;
        this.transferResources();
        this.buildTrader();
        this.drawManualExports();
    }

    transferResources() {
        if(this.terminal.cooldown) return;
        if(!this.roomai.intervals.transferResources.isActive()) return;

        // reversing to avoid selling off energy before transfering mats
        let resources = Object.keys(this.terminal.store).reverse();
        this.transferManualExports(resources) ||
            this.transferResourcesAboveMaximum(resources) ||
            this.transferResourcesAboveMinimum(resources);
    }

    transferManualExports(resources) {
        for(var resource of resources) {
            if(this.performManualExport(resource)) return true;
        }

        return false;
    }

    transferResourcesAboveMaximum(resources) {
        for(var resource of resources) {
            let exportable = this.trading.requiredExportFromRoom(resource);
            if(exportable >= this.trading.minimumExportAmount(resource)) {
                if(this.balanceToEmpire(resource, exportable, possibleImportCache)) {
                    return true;
                } else if(this.provideSupport(resource, exportable)) {
                    return true;
                } else if(Game.time % 25 === 10) {
                    let sellable = this.trading.sellableAmount(resource);
                    if(sellable >= this.trading.minimumExportAmount(resource)) {
                        if(Memory.onlySellToNpcs) {
                            if(this.sellToNpcs(resource, sellable)) return true;
                        } else {
                            if(this.sellToFreeMarket(resource, sellable)) return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    transferResourcesAboveMinimum(resources) {
        for(var resource of resources) {
            let exportable = this.trading.possibleExportFromRoom(resource);
            if(exportable >= this.trading.minimumExportAmount(resource)) {
                if(this.balanceToEmpire(resource, exportable, requiredImportCache)) {
                    return true;
                }
            }
        }

        return false;
    }

    performManualExport(resource) {
        let exportDescription = this.trading.manualExports[resource];
        if(!exportDescription) return false;

        let exportable = Math.min(exportDescription.amount, this.terminal.store[resource] || 0);
        exportable = Math.min(exportable, MAX_TRANSFER);
        if(exportable >= this.trading.minimumExportAmount(resource)) {
            let result = this.terminal.send(resource, exportable, exportDescription.room, "Manual export");
            if(result === OK) {
                exportDescription.amount -= exportable;
                if(exportDescription.amount < this.trading.minimumExportAmount(resource)) {
                    delete this.trading.manualExports[resource];
                }
                return true;
            }
        }
        return false;
    }

    balanceToEmpire(resource, amount, cache) {
        let choice = cache.chooseRecipient(resource);
        if(choice) {
            let sentAmount = Math.min(amount, MAX_TRANSFER, Math.max(100, choice.miss));
            this.terminal.send(resource, sentAmount, choice.room.name, "empire balancing");
            cache.reduceMiss(choice.room, resource, sentAmount);
            return true;
        }

        return false;
    }

    provideSupport(resource, amount) {
        let requests = Memory.tradeRequests;
        if(!requests || !requests[resource]) return false;
        if(resource === RESOURCE_POWER && Memory.sellPower) return false;

        let target = requests[resource].shift();
        if(!target) return false;

        let sendingAmount = Math.min(amount, target.amount, MAX_TRANSFER);
        this.terminal.send(resource, sendingAmount, target.room, "Supporting allied forces");
        target.amount -= sendingAmount;

        if(target.amount > 0) {
            requests[resource].push(target);
        }

        return true;
    }

    sellToFreeMarket(resource, amount) {
        amount = _.min([amount, this.terminal.store[resource]]);
        if(amount < this.trading.minimumExportAmount(resource)) return false;
        let minPrice = null;
        let history = Game.market.getHistory(resource);
        let lastDay = history[history.length - 1];

        if(lastDay) {
            minPrice = lastDay.avgPrice - (allowedSalesHistoryDeviation * lastDay.stddevPrice);
        } else {
            let sales = Game.market.getAllOrders((o) => o.type == "sell" && o.resourceType == resource && o.remainingAmount > 100);
            if(sales.length > 0) {
                minPrice = _.min(sales, 'price').price * allowedBuySellPriceRatio;
            }
        }

        if(!minPrice) {
            console.log(`Could not determine minimum price for ${resource}. Giving up.`);
            return false;
        }

        let buyers = _.filter(Game.market.getAllOrders({ type: "buy", resourceType: resource }), (o) => o.amount > 0 && o.price >= minPrice);
        buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, this.room.name, true));
        let buyer = _.sortBy(buyers, (b) => -b.price).shift();
        if(!buyer) return false;

        let dealAmount = Math.min(amount, buyer.amount);
        let dealCost = Game.market.calcTransactionCost(dealAmount, this.room.name, buyer.roomName);
        let energyAvailable = this.terminal.store[RESOURCE_ENERGY];
        if(dealCost > energyAvailable) {
            dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
        }

        Game.market.deal(buyer.id, dealAmount, this.room.name);
        return true;
    }

    sellToNpcs(resource, amount) {
        amount = _.min([amount, this.terminal.store[resource]]);
        if(amount < this.trading.minimumExportAmount(resource)) return false;

        let buyers = _.filter(Game.market.getAllOrders({ type: "buy", resourceType: resource }), (o) => o.amount > 0 && npcRoomRegex.exec(o.roomName));
        buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, this.room.name, true));
        let buyer = _.sortBy(buyers, (b) => -b.price).shift();
        if(!buyer) return false;

        let dealAmount = Math.min(amount, buyer.amount);
        let dealCost = Game.market.calcTransactionCost(dealAmount, this.room.name, buyer.roomName);
        let energyAvailable = this.terminal.store[RESOURCE_ENERGY];
        if(dealCost > energyAvailable) {
            dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
        }

        Game.market.deal(buyer.id, dealAmount, this.room.name);
        return true;
    }

    buildTrader() {
        if(!this.roomai.canSpawn() || spawnHelper.numberOfLocalCreeps(this.roomai, trader.name) >= 1) return;
        if(this.trading.resourcesExportableFromStorage.length > 0 || this.trading.resourcesImportableToStorage.length > 0) {
            this.roomai.spawn(trader.parts, { role: trader.name });
        }
    }

    drawManualExports() {
        let yOffset = 0;
        for(let resource in this.trading.manualExports) {
            let exportDescription = this.trading.manualExports[resource];
            this.room.visual.text(resource + ": " + exportDescription.amount, this.terminal.pos.x + 1, this.terminal.pos.y - yOffset, { stroke: "#000", font: 0.4, align: "left" });
            yOffset += 0.5;
        }
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'TradingAspect');
