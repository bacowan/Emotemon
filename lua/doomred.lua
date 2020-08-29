local constants = require 'constants'
local battleHandler = require 'battleHandler'
local memorySearch = require 'memorySearch'

print 'script running'

local currentBattleType = 0

function battleStarting()
    local battleType = memory.readbyte(constants.battleTypePointer)
    if (battleType ~= currentBattleType and battleType ~= constants.battleTypes["none"]) and (battleType == constants.battleTypes["wild"] or battleType == constants.battleTypes["trainer"]) then
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

function setup()
    local f = io.open(constants.defaultEmoteFileName, 'r')
    io.input(f)

    local pixels = io.read("*l")
    local palette = io.read("*l")

    io.close(f)

    local pixelsString = battleHandler.hexStringToByteArray(pixels)
    local paletteString = battleHandler.hexStringToByteArray(palette)

    overwriteSprite(constants.bulbasaurOffset, pixelsString, paletteString)
    overwriteSprite(constants.charmanderOffset, pixelsString, paletteString)
    overwriteSprite(constants.squirtleOffset, pixelsString, paletteString)
end

function overwriteSprite(offset, pixels, palette)
    local baseImageAddress = memorySearch.findEmptySpace(#pixels)
    print(palette)
    for i=1,#pixels do
        memory.writebyte(baseImageAddress+i-1, pixels[i])
    end
    memory.writedword(constants.frontSpritePointer+offset*8, baseImageAddress)
    memory.writedword(constants.backSpritePointer+offset*8, baseImageAddress)
    
    -- write the palette
    local basePaletteAddress = memorySearch.findEmptySpace(#palette)
    print(string.format("%x",basePaletteAddress))
    for i=1,#palette do
        memory.writebyte(basePaletteAddress+i-1, palette[i])
    end
    memory.writedword(constants.palettePointer+offset*8, basePaletteAddress)
end

setup()
gui.register(onFrame)