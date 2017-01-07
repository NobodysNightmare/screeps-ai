module.exports = {
    perform: function(room) {
        if(Game.time % 10 != 0) {
            return;
        }
        
        if(!room.controller || room.controller.level < 6) {
            return;
        }
        
        for(var mineral of room.find(FIND_MINERALS)) {
            room.createConstructionSite(mineral.pos, STRUCTURE_EXTRACTOR);
        }
    }
};