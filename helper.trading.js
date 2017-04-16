module.exports = {
    baselineAmount: 10000,
    blacklistedResources: [
        RESOURCE_ENERGY,
        RESOURCE_POWER
    ],
    findImportableResource: function(room) {
        return _.find(_.keys(room.terminal.store), (res) => !this.blacklistedResources.includes(res) && (room.storage.store[res] || 0) < this.baselineAmount);
    },
    findExportableResource: function(room) {
        return _.find(_.keys(room.storage.store), (res) => !this.blacklistedResources.includes(res) && room.storage.store[res] > this.baselineAmount);
    }
}
