const logistic = require("helper.logistic");

module.exports = class Trading {
    constructor(room) {
        this.room = room;
        this.storage = this.room.storage;
        this.terminal = this.room.terminal;
    }

    get sellingBlacklist() {
        return [
            RESOURCE_ENERGY,
            RESOURCE_POWER
        ];
    }
    
    get terminalEnergyBuffer() {
        return 110000;
    }

    isTradingPossible() {
        return this.terminal && this.storage;
    }

    get resourcesImportableToStorage() {
        return _.filter(_.keys(this.terminal.store), (res) => this.neededImportToStorage(res) > 0);
    }

    neededImportToStorage(resource) {
        if(resource === RESOURCE_ENERGY && this.terminal.store[resource] <= this.terminalEnergyBuffer) return 0;
        
        return Math.max(0, this.baselineAmount(resource) - (this.storage.store[resource] || 0));
    }

    get resourcesExportableFromStorage() {
        return _.filter(_.keys(this.storage.store), (res) => this.possibleExportFromStorage(res) > 0);
    }

    possibleExportFromStorage(resource) {
        return Math.max(0, (this.storage.store[resource] || 0) - this.baselineAmount(resource));
    }

    possibleExportFromRoom(resource) {
        let amountInTerminal = this.terminal.store[resource] || 0;
        let amountInStorage = this.storage.store[resource] || 0;
        let excessAmount = amountInTerminal + amountInStorage - this.baselineAmount(resource);
        return Math.min(amountInTerminal, excessAmount);
    }

    neededImportToRoom(resource) {
        let amountInTerminal = this.terminal.store[resource] || 0;
        let amountInStorage = this.storage.store[resource] || 0;
        return Math.max(0, this.baselineAmount(resource) - (amountInTerminal + amountInStorage));
    }

    sellableAmount(resource) {
        if(this.sellingBlacklist.includes(resource)) return 0;
        return this.possibleExportFromRoom(resource);
    }

    baselineAmount(resource) {
        if(this.room.ai().mode == "unclaim") {
            if(resource == RESOURCE_ENERGY) return 30000;
            
            return 0;
        }
        
        if(resource == RESOURCE_ENERGY) return 600000;
        
        if(resource == RESOURCE_POWER) {
            if(this.room.powerSpawn()) return 15000;
            return 0;
        }

        return 10000;
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Trading');
