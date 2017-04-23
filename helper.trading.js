module.exports = {
    baselineAmount: 10000,
    blacklistedResources: [
        RESOURCE_ENERGY,
        RESOURCE_POWER
    ],
    sellingBlacklist: [
        RESOURCE_KEANIUM
    ],
    findImportableResource: function(room) {
        return _.find(_.keys(room.terminal.store), (res) => !this.blacklistedResources.includes(res) && this.neededImportAmount(room, res) > 0);
    },
    findExportableResource: function(room) {
        return _.find(_.keys(room.storage.store), (res) => !this.blacklistedResources.includes(res) && this.possibleExportAmount(room, res) > 0);
    },
    neededImportAmount: function(room, resource) {
        return Math.max(0, this.baselineAmount - (room.storage.store[resource] || 0));
    },
    possibleExportAmount: function(room, resource) {
        return Math.max(0, (room.storage.store[resource] || 0) - this.baselineAmount);
    }
}
