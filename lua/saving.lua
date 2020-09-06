local constants = require 'constants'
local substructureUtils = require 'substructureUtils'

local M = {}

function save(spriteSizes, saveFilePath)
    local caughtPokemonIds = {}
    
    -- check party pokemon
    for i=1,6 do
        local pokemonId = checkForExistingPokemon(constants.partyPokemonPointers[i])
        if (pokemonId ~= nil) then
            table.insert(caughtPokemonIds, pokemonId)
        end
    end

    -- check box pokemon
    local boxPointer = memory.readdword(constants.boxPokemonPointer)
    for i=1,constants.boxPokemonCount do
        local pokemonId = checkForExistingPokemon(boxPointer + (constants.boxPokemonSize * (i - 1)) + constants.pokemonBoxStartingOffset)
        if (pokemonId ~= nil) then
            table.insert(caughtPokemonIds, pokemonId)
        end
    end

    local saveFile = io.open(saveFilePath, "w+")
    io.output(saveFile)
    for i=1,#caughtPokemonIds do
        io.write(hexText(caughtPokemonIds[i]) .. "\n" .. getSavePokemonText(spriteSizes, caughtPokemonIds[i]))
    end

    io.close(saveFile)
end

function getSavePokemonText(spriteSizes, id)
    local text = ""
    local pokemonNamePointer = memory.readbyte(constants.pokemonNamesPointer + id)
    for i=1,constants.pokemonNameSize do
        text = text .. hexText(memory.readbyte(pokemonNamePointer + i - 1))
    end
    text = text .. "\n"

    local baseStatsPointer = hexText(memory.readbyte(constants.baseStatsPointer + id))

    text = text .. hexText(memory.readbyte(baseStatsPointer + constants.baseType1Offset))
    text = text .. "\n"
    text = text .. hexText(memory.readbyte(baseStatsPointer + constants.baseType2Offset))
    text = text .. "\n"
    text = text .. hexText(memory.readbyte(baseStatsPointer + constants.baseAbility1Offset))
    text = text .. "\n"
    text = text .. hexText(memory.readbyte(baseStatsPointer + constants.baseAbility2Offset))
    text = text .. "\n"
    text = text .. hexText(memory.readbyte(baseStatsPointer + constants.baseGenderOffset))
    text = text .. "\n"
    
    
    local movesLearnableAddress = memory.readdword(constants.movesetPointers+id*4) -- TODO: why 4?
    local currentByte = 0
    while currentByte ~= 0xFF do
        local newByte = memory.readbyte(movesLearnableAddress)
        text = text .. hexText(newByte)
        movesLearnableAddress = movesLearnableAddress + 1
        currentByte = newByte
    end
    text = text .. "\n"

    if (spriteSizes[id] ~= nil) then
        local spriteAddress = memory.readdword(constants.frontSpritePointer+id*8) -- TODO: why 8?
        for i=1,spriteSizes[id].pixels do
            text = text .. hexText(memory.readbyte(spriteAddress + i - 1))
        end
        text = text .. "\n"
    
        local paletteAddress = memory.readdword(constants.palettePointer+id*8) -- TODO: why 8?
        for i=1,spriteSizes[id].palette do
            text = text .. hexText(memory.readbyte(paletteAddress + i - 1))
        end
        text = text .. "\n"
    else
        text = text .. "\n\n"
    end
    
    return text
end

function hexText(text)
    return string.format("%02x", text)
end

function checkForExistingPokemon(pointer)
    local pokemonData = substructureUtils.getAllPokemonData(pointer)
    local pokemonId = bit.lshift(pokemonData.growth[2], 8) + pokemonData.growth[1]
    if (pokemonId ~= 0) then
        return pokemonId
    else
        return nil
    end
end

function load(saveFilePath)
end

return M