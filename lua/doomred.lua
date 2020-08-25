local constants = require 'constants'
local battleHandler = require 'battleHandler'

print 'script running'

local currentBattleType = 0

function battleStarting()
    local battleType = memory.readbyte(constants.battleTypePointer)
    if (battleType ~= currentBattleType and battleType ~= constants.battleTypes["none"]) and (currentBattleType == constants.battleTypes["wild"] or currentBattleType == constants.battleTypes["trainer"]) then
        currentBattleType = battleType
        return true
    end
    currentBattleType = battleType
    return false
end

function onFrame()
    if battleStarting() then
        battleHandler.handleBattle()
    end
end

gui.register(onFrame)