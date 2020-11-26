# NobodysNightmare's Screeps AI

This is my personal AI for the computer game [Screeps](https://screeps.com).

## Manual control

### Memory Overrides

#### `Memory.hibernateGclFarming`

If `true`, RCL 8 rooms will only perform a minimal amount of upgrading,
but not upgrade at the maximum possible rate. This is intended to significantly
reduce the amount of energy spent, which in turn can shut down a larger part of
CPU consumption, since fewer remote mines should be necessary.

#### `Memory.sellPower`

If `true`, power is sold on the market rather than being refined.

#### `Memory.onlySellToNpcs`

If `true`, no trading will be performed with other players. Market code will
only consider NPC traders to sell resources.

#### `Memory.disableAutoExpansion`

If `true`, the AI will not try to automatically expand into new rooms.
This is useful if politics should drive expansion.

Note: Automatic expansion is currently experimental. It affects both
claiming new rooms and choosing remote mines.

#### `Memory.generatePixels`

Global switch to enable pixel generation. Pixels will be generated whenever the
bucket is full.

### Constructions

Multiple structures and structure groups can be pre-planned.
The general rule is to place a flag called `buildName`, to plan a structure called
`Name` (see below for valid values) at the specified position.
Using a flag called `removeName` you can remove the named structure at that position.

Depending on the structure, only a limited amount might be planned or the flag color might
have a meaning.

#### Extension Clusters

* **Building name:** `extensionCluster`
* **color:** no significance

Marks an area where multiple extensions will be built. The outline exactly fits the
roads that will be placed around the extensions.

#### Towers

* **Building name:** `tower`
* **color:** no significance

Plans a tower at the specified location.

#### Storage

* **Building name:** `storage`
* **color:** Determines direction of attached link. Starting top, clockwise.
  Only the first 4 colors are valid.

Marks the spot where the storage of the room shall be built. The outlines arrow indicates
at which location the associated link of the storage will be placed.

Note: Since only one storage can be placed, placing additional storages will clear the old
storage location.

#### Terminal

* **Building name:** `terminal`
* **color:** no significance

Plans a terminal at the specified location.

#### Reactor

* **Building name:** `reactor`
* **color:** Determines direction of entrance into reactor. Starting top left, clockwise.
  Only the first 4 colors are valid.

Around that spot labs will be built that will then process minerals to
compounds.

#### Booster

* **Building name:** `booster`
* **color:** no effect

Build a lab that will be used to boost creeps.

#### Walls

* **Building name:** `wall`

Need to place flag twice. First flag will set the start position, second flag the end.
Wall will be built as the corner from start to end, going into horizontal direction first.

### Spawning Creeps

There are multiple creep spawning operations available. They are all controlled using the same scheme.
The room that should spawn creeps receives a flag called `spawnNameX`, where `Name` is the name of the
operation (see below) and `X` is the operation identifier (e.g. `1`). The room targeted by the operation receives
a flag called `nameX`, where `name` and `X` again refer to the name and identifier of the operation.

Depending on the operation, the color of the spawn flag might indicate the strength of the operation
(see below). Having different operation identifiers allows to run multiple operations of the same type
simultaneously.

Some operations might not require flag to be permanently placed (see description below).

#### Farming Power Banks

* **Operation name:** `power`
* **color:** Controls number of simultaneous farmers.

Automatically scans the given room for a power bank. If one is detected, this operation will spawn
all creeps neccessary to farm the power bank.

#### Farming Deposits

* **Operation name:** `deposits`
* **color:** no effect

Automatically scans the selected rooms for deposits. If one is detected, this operation will spawn
all creeps neccessary to farm it until the cooldown is unsustainably high.

Placing the flag `depositsX` in a room that has not yet been selected will select the room,
while placing it in a room that has already been selected will deselect it.

## Modern operations

"Modern" operations are intended to be created through code (i.e. automatically).
However, as long as that code doesn't exist they can still be used manually as well.

It usually goes like this

    Operation.createOperation("opType", { some: "memory" })

#### Attacking hostile rooms

Spawns some creeps that attack a hostile room. Either `attackers`, which can engage creeps and structures
or `dismantlers`, which can only engage structures, but are more effective at that.

    Operation.createOperation("attack", { supportRoom: "roomName", targetPosition: new AbsolutePosition(new RoomPosition(x, y, roomName)) })

Optional parameters (in memory):

* `attackRole`: Either `attacker` or `dismantler`
* `attackerCount`: Number of attacker creeps to spawn (default 1)
* `useHeal`: Spawn a healer for each attacker.
* `useTough`: Use configurations on attackers and healers that include tough parts to make healing more efficient.
* `timeout`: If specified, the operation will be terminated after the given amount of ticks
* `terminateAfterTick`: Same as `timeout`, but specifying an absolute tick number after which to terminate the operation
* `terminateAfterSuccess`: Terminate the operation once all key structures have been destroyed.

#### Attacking a controller

Spawns a creep to attack a controller.

    Operation.createOperation("downgrade", { supportRoom: "roomName", targetRoom: "roomName" })

#### Draining a room

Spawns a pair of hopper and healer. The hopper will try to drain energy from the target room by being
attacked by towers.

    Operation.createOperation("drain", { supportRoom: "roomName", targetRoom: "roomName" })

Optional parameters (in memory):

* `useBoosts`: Whether to boost the healer.
* `timeout`: If specified, the operation will be terminated after the given amount of ticks
* `terminateAfterTick`: Same as `timeout`, but specifying an absolute tick number after which to terminate the operation

#### Stealing resources

Spawns creeps to scoop resources from a room.
They will pickup resources on the ground and in containers.

    Operation.createOperation("scoop", { supportRoom: "roomName", targetRoom: "roomName" })

Optional parameters (in memory):

* `scooperCount`: Number of scooper creeps to spawn (default 1)
* `timeout`: If specified, the operation will be terminated after the given amount of ticks
* `terminateAfterTick`: Same as `timeout`, but specifying an absolute tick number after which to terminate the operation
* `terminateWhenEmpty`: Terminates the operation, once the main storage and terminal of a room are depleted.
* `waitForClear`: Do not start spawning scoopers, before the room is considered safe (no towers or creeps).

### Claiming a room

Spawns a claimer followed by conquerors to build up the first spawn. The spawn will be built
at the location of the claim flag in the target room.

After the spawn was built, the support room will continue to support the target room by sending
fully upgraded miners into it, until the target room can take care of that by itself.

    Operation.createOperation("claim", { supportRoom: "roomName", spawnPosition: new AbsolutePosition(new RoomPosition(x, y, roomName)) })

Optional parameters (in memory):

* `spawnBuilders`: Support room will also send builders to the target room to speed up building stuff
* `autoPlanRoom`: Set to true, to let the layout of the room be automatically planned once captured (**experimental**)

## TODOs

* Use links to collect energy from remote mines at room border
* Better defense mechanics
    * spawn defenders in response to attackers force (no over-delivering)
    * towers should attack target picked by defense aspect
    * defense aspect should actually "think" about which target to pick
* Automatically start claiming as soon as room is ready (e.g. if it is currently claimed by another player)
* Flag-based interaction
    * Manual operation for supply transports
* Use observers to obtain vision on a room
* Improve own pathfinder
    * Plan routes depending on known facts about rooms
    * automatically collect known facts about rooms
* Automated base-building?
