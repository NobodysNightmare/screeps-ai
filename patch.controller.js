StructureController.prototype.ticksDowngraded = function() {
    return CONTROLLER_DOWNGRADE[this.level] - this.ticksToDowngrade;
}