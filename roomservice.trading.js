const logistic = require("helper.logistic");

const baseMinerals = [
                        RESOURCE_OXYGEN, RESOURCE_HYDROGEN,
                        RESOURCE_LEMERGIUM, RESOURCE_UTRIUM,
                        RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM,
                        RESOURCE_CATALYST
                    ];
const rawCommodities = [RESOURCE_MIST, RESOURCE_BIOMASS, RESOURCE_METAL, RESOURCE_SILICON];
const refinedCommodities = Object.keys(COMMODITIES).filter((r) => r.length > 1 && !rawCommodities.includes(r) && r != "energy");

// TODO: remove duplication with labs aspect and selling blacklist
const t3Boosts = ["XUH2O", "XLH2O", "XLHO2", "XGHO2", "XZHO2", "XZH2O", "XGH2O", "XKHO2"];
const intermediateCompounds = Object.keys(REACTIONS).filter((c) => !baseMinerals.includes(c));

const maximumExportBuffer = 2000;

module.exports = class Trading {
    constructor(room) {
        this.room = room;
        this.storage = this.room.storage;
        this.terminal = this.room.terminal;

        if(!room.memory.trading) {
            room.memory.trading = {
                manualExports: {}
            }
        }
        this.memory = room.memory.trading;
    }

    get sellingBlacklist() {
        return [
            RESOURCE_ENERGY,
            "XGHO2",
            "XGH2O",
            "XKHO2",
            "XKH2O",
            "XLHO2",
            "XLH2O",
            "XUHO2",
            "XUH2O",
            "XZHO2",
            "XZH2O",
            "G",
            "OH"
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

        let baselineMiss = this.minNeededAmount(resource) - (this.storage.store[resource] || 0);
        let amountInTerminal = this.terminal.store[resource];

        let manualExport = this.manualExports[resource];
        if(manualExport) {
            return Math.max(0, Math.min(amountInTerminal - manualExport.amount, baselineMiss));
        }

        return Math.max(0, baselineMiss, amountInTerminal - maximumExportBuffer);
    }

    get resourcesExportableFromStorage() {
        return _.filter(_.keys(this.storage.store), (res) => this.possibleExportFromStorage(res) > 0);
    }

    possibleExportFromStorage(resource) {
        let amountInTerminal = this.terminal.store[resource];

        let manualExport = this.manualExports[resource];
        if(manualExport) {
            return Math.max(0, manualExport.amount - amountInTerminal);
        }

        return Math.max(0, Math.min(this.storage.store[resource] - this.minNeededAmount(resource), maximumExportBuffer - amountInTerminal));
    }

    // amount of the resource that needs to be evicted from the room because it is
    // over the maximum alloted amount
    requiredExportFromRoom(resource, options) {
        if(!this.storage) return 0;
        if(!this.terminal) return 0;

        let amountInTerminal = this.terminal.store[resource];
        let amountInStorage = this.storage.store[resource];
        let excessAmount = amountInTerminal + amountInStorage - this.maxStorageAmount(resource);
        if(options && options.showExcess) return excessAmount;
        return Math.min(amountInTerminal, excessAmount);
    }

    // amount that could be exported from the room, if there is demand elsewhere
    possibleExportFromRoom(resource) {
        let amountInTerminal = this.terminal.store[resource];
        let amountInStorage = this.storage.store[resource];
        let excessAmount = amountInTerminal + amountInStorage - this.minNeededAmount(resource);
        return Math.min(amountInTerminal, excessAmount);
    }

    // amount that need to be imported into the room, because it currently has less
    // than it wants to have
    requiredImportToRoom(resource) {
        let amountInTerminal = this.terminal.store[resource];
        let amountInStorage = this.storage.store[resource];
        return Math.max(0, this.minNeededAmount(resource) - (amountInTerminal + amountInStorage));
    }

    // amount that could be imported into the room, because there is capacity for the resource
    // left
    possibleImportToRoom(resource) {
        let amountInTerminal = this.terminal.store[resource];
        let amountInStorage = this.storage.store[resource];
        return Math.max(0, this.maxStorageAmount(resource) - (amountInTerminal + amountInStorage));
    }

    sellableAmount(resource) {
        if(this.sellingBlacklist.includes(resource)) return 0;
        if(resource === RESOURCE_POWER && !Memory.sellPower) return 0;

        return this.requiredExportFromRoom(resource);
    }

    // The room wants to have at least this much of a resource in stock
    // (e.g. because it is needed internally).
    // if it goes above this level, it will start sharing with other rooms that
    // did not yet fill their minimum need.
    minNeededAmount(resource) {
        if(this.room.ai().mode === "unclaim") return 0;

        if(resource == RESOURCE_ENERGY) return 400000;

        if(resource == RESOURCE_POWER) {
            if(this.room.powerSpawn() && !Memory.sellPower) return 1000;
            return 0;
        }

        if(baseMinerals.includes(resource)) {
            if(this.room.ai().labs.reactor && this.room.ai().labs.reactor.isValid()) {
                return 10000;
            } else {
                return 0;
            }
        }

        if(t3Boosts.includes(resource)) return 10000;
        if(resource === "G") return 5000;

        // ensures that compounds don't get stuck in terminal
        // TODO: should we actually consider the current reaction for this,
        // so that materials are shifted towards the right reactors?
        if(intermediateCompounds.includes(resource)) {
            if(this.room.ai().labs.reactor && this.room.ai().labs.reactor.isValid()) {
                return 2500;
            } else {
                return 0;
            }
        }

        if(rawCommodities.includes(resource) || refinedCommodities.includes(resource)) {
            if(this.room.ai().factory.isAvailable() && this.room.ai().factory.usableResources.includes(resource)) {
                return 2000;
            } else {
                return 0;
            }
        }

        return 0;
    }

    // The room can afford keeping this much of a resource in stock, acting
    // as a reserve.
    // it really doesn't want to have more than that.
    maxStorageAmount(resource) {
        if(resource == RESOURCE_ENERGY) {
            if(this.room.ai().mode === "unclaim") return 30000;
            if(this.room.ai().mode === "support") return 400000;

            return 600000;
        }

        if(this.room.ai().mode === "unclaim") return 0;

        if(resource == RESOURCE_POWER) {
            if(Memory.sellPower) return 0;
            if(this.room.powerSpawn()) return 15000;
            return 5000;
        }

        if(baseMinerals.includes(resource)) return 20000;
        if(t3Boosts.includes(resource)) return 15000;
        if(resource === "G") return 10000;

        if(rawCommodities.includes(resource) || refinedCommodities.includes(resource)) {
            if(this.room.ai().factory.isAvailable() && this.room.ai().factory.usableResources.includes(resource)) {
                return 5000;
            } else {
                return 0;
            }
        }

        return 5000;
    }

    // Not considering resources with an excess of less than that amount for export
    // This is mostly a protection from micro transactions that might block terminal
    // time for other resources
    minimumExportAmount(resource) {
        if(resource === RESOURCE_ENERGY) return 500;
        if(resource === RESOURCE_POWER) return 10;
        if(refinedCommodities.includes(resource)) return 10;

        return 100;
    }

    get manualExports() {
        return this.memory.manualExports;
    }

    exportManually(resource, amount, targetRoom) {
        if(!resource || !amount || !targetRoom) return false;

        this.manualExports[resource] = {
            amount: amount,
            room: targetRoom
        };

        return true;
    }

    clearManualExport(resource) {
        delete this.manualExports[resource];
    }
}

const profiler = require("screeps-profiler");
profiler.registerClass(module.exports, 'Trading');
