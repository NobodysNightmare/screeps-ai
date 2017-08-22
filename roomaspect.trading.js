const spawnHelper = require("helper.spawning");
const trader = require("role.trader");

const MAX_TRANSFER = 20000;
const TERMINAL_MAX_FILL = 270000;
const NPC_ONLY_SALES = true;

const npcRoomRegex = /^[WE][0-9]*0[NS][0-9]*0$/;

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
        this.transferExcessResource();
        this.buildTrader();
        this.drawManualExports();
    }

    transferExcessResource() {
        if(this.terminal.cooldown) return;
        for(var resource in this.terminal.store) {
            if(this.performManualExport(resource)) return;
            let exportable = this.trading.possibleExportFromRoom(resource);
            if(exportable >= 100) {
                if(this.balanceToEmpire(resource, exportable)) {
                    return;
                } else if(this.provideSupport(resource, exportable)) {
                    return;
                } else if(Game.time % 200 === 50) {
                    let sellable = this.trading.sellableAmount(resource);
                    if(sellable >= 100) {
                        if(NPC_ONLY_SALES) {
                            return this.sellToNpcs(resource, sellable);
                        } else {
                            return this.sellToFreeMarket(resource, sellable);
                        }
                    }
                }
            }
        }
    }

    performManualExport(resource) {
        let exportDescription = this.trading.manualExports[resource];
        if(!exportDescription) return;
        
        let exportable = Math.min(exportDescription.amount, this.terminal.store[resource] || 0);
        if(exportable >= 100) {
            let result = this.terminal.send(resource, Math.min(exportable, MAX_TRANSFER), exportDescription.room, "Manual export");
            if(result === OK) {
                exportDescription.amount -= exportable;
                if(exportDescription.amount < 100) {
                    delete this.trading.manualExports[resource];
                }
                return true;
            }
        }
        return false;
    }

    balanceToEmpire(resource, amount) {
        let targets = _.map(_.filter(Game.rooms, (r) => r.ai() && r.ai().trading.isTradingPossible() && _.sum(r.terminal.store) < TERMINAL_MAX_FILL), (r) => ({ room: r, miss: r.ai().trading.neededImportToRoom(resource) }));
        let choice = _.sortBy(_.filter(targets, (t) => t.miss > 0), (t) => -t.miss)[0];
        if(choice) {
            this.terminal.send(resource, Math.min(amount, MAX_TRANSFER, Math.max(100, choice.miss)), choice.room.name, "empire balancing");
            return true;
        }

        return false;
    }
    
    provideSupport(resource, amount) {
        if(!Memory.resourceSupport || !Memory.resourceSupport[resource]) return false;
        
        let target = Memory.resourceSupport[resource].shift();
        if(!target) return false;
        Memory.resourceSupport[resource].push(target);
        
        this.terminal.send(resource, Math.min(amount, MAX_TRANSFER), target, "Supporting allied forces");
        return true;
    }

    sellToFreeMarket(resource, amount) {
        amount = _.min([amount, this.terminal.store[resource]]);
        if(amount < 100) return;
        let sales = Game.market.getAllOrders((o) => o.type == "sell" && o.resourceType == resource && o.remainingAmount > 100);
        let minPrice = _.min(sales, 'price').price * 0.90;
        
        let buyers = Game.market.getAllOrders((o) => o.type == "buy" && o.resourceType == resource && o.amount > 0 && o.price >= minPrice);
        buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, this.room.name, true));
        let buyer = _.sortBy(buyers, (b) => -b.price).shift();
        if(!buyer) return;

        let dealAmount = Math.min(amount, buyer.amount);
        let dealCost = Game.market.calcTransactionCost(dealAmount, this.room.name, buyer.roomName);
        let energyAvailable = this.terminal.store[RESOURCE_ENERGY];
        if(dealCost > energyAvailable) {
            dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
        }

        Game.market.deal(buyer.id, dealAmount, this.room.name);
    }
    
    sellToNpcs(resource, amount) {
        amount = _.min([amount, this.terminal.store[resource]]);
        if(amount < 100) return;
        
        let buyers = Game.market.getAllOrders((o) => o.type == "buy" && o.resourceType == resource && o.amount > 0 && npcRoomRegex.exec(o.roomName));
        buyers = _.sortBy(buyers, (b) => Game.map.getRoomLinearDistance(b.roomName, this.room.name, true));
        let buyer = _.sortBy(buyers, (b) => -b.price).shift();
        if(!buyer) return;

        let dealAmount = Math.min(amount, buyer.amount);
        let dealCost = Game.market.calcTransactionCost(dealAmount, this.room.name, buyer.roomName);
        let energyAvailable = this.terminal.store[RESOURCE_ENERGY];
        if(dealCost > energyAvailable) {
            dealAmount = Math.floor(dealAmount * (energyAvailable / dealCost));
        }

        Game.market.deal(buyer.id, dealAmount, this.room.name);
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
