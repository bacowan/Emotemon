local constants = require 'constants'
local battleHandler = require 'battleHandler'

print 'script running'

function battleStarting()
    battleType = memory.readbyte(battleTypePointer)
    if (battleType ~= currentBattleType and battleType ~= constants.battleType["none"]) and (currentBattleType == constants.battleType["wild"] or currentBattleType == constants.battleType["trainer"]) then
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


















local wildPokemonBattleFunction = 0x08010672
local bulbasaurPalettePointer = 0x08237384
local bulbasaurSpritePointer = 0x082365C4
local bulbasaurPalette = 0x08EC24B0--0x08D2FE78
local bulbasaurSprite = 0x08FBD6A0--0x08D305AC
local battleTypePointer = 0x02022B4C
local romStartAddress = 0x08000000
local romEndAddress = 0x09FC03FF
local surroundingBlankSpace = 0


currentBattleType = 0

function hexStringToByteArray(string)
    array = {}
    for i=1,#string/2 do
        array[#array+1] = tonumber(string:sub(i*2-1,i*2), 16)
    end
    return array
end

function findEmptySpace(length)
    emptyByteCount = 0
    
    offset = romStartAddress
    while offset < romEndAddress do
        if memory.readbyte(offset) == 0xFF then
            if emptyByteCount == length + 2*surroundingBlankSpace then
                return offset - emptyByteCount + surroundingBlankSpace
            end
            emptyByteCount = emptyByteCount + 1
            offset = offset + 1
        else
            emptyByteCount = 0
            offset = offset + 4-(offset%4)
        end
    end
    print('no empty space found!')
end

