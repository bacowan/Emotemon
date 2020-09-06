local constants = require 'constants'
local substructureUtils = require 'substructureUtils'
local memorySearch = require 'memorySearch'
local serverCommunication = require 'serverCommunication'

local M = {}

local nextPokemonId = 1

function tablesEqual(t1,t2)
    if (#t1~=#t2) then return false end
    for i=1,#t1 do
        if (t1[i] ~= t2[i]) then
            return false
        end
    end
    return true
end

function overwritePokemonFromPipe(spriteSizes, pokemonPointer)
    local rawData = serverCommunication.readPipe()
    local newPokemonData = serverCommunication.formatRawPokemonData(rawData)
    local newPokemonId = overwritePokemon(newPokemonData, pokemonPointer)
    local spriteSize = {}
    spriteSize.palette = #newPokemonData.emotePalette
    spriteSize.pixels = #newPokemonData.emotePixels
    print(spriteSize)
    spriteSizes[newPokemonId] = spriteSize
end

function overwritePokemon(newPokemonData, pokemonPointer)
    local pokemonData = substructureUtils.getAllPokemonData(pokemonPointer)
    
    -- read in the base stats
    local baseStats = memory.readbyterange(constants.baseStatsPointer + (nextPokemonId-1)*constants.baseStatsSize, constants.baseStatsSize)
    
    -- overwrite the substructres with the input data
    level = memory.readbyte(pokemonPointer+constants.levelOffset)
    levelUpType = memory.readbyte(constants.baseStatsPointer + (nextPokemonId-1)*28 + 19) -- TODO: what do these magic numbers mean?
    substructureUtils.convertSubstructures(newPokemonData, nextPokemonId, level, levelUpType, pokemonData.growth, pokemonData.attacks, pokemonData.ev, pokemonData.misc)
    
    -- write the encrypted data
    local encryptedData, checksum = substructureUtils.encrypt(pokemonData.substructureOrder, pokemonData.growth, pokemonData.attacks, pokemonData.ev, pokemonData.misc, pokemonData.encryptionKey)
    for i=1,4 do
        for j=1,#encryptedData[i] do
            memory.writebyte(pokemonPointer + constants.dataStructureOffset + (i-1)*constants.substructureSize + (j-1), encryptedData[i][j])
        end
    end
    memory.writeword(pokemonPointer+constants.checksumOffset, checksum)
    
    -- write nickname
    for i=1,#newPokemonData.name do
        memory.writebyte(pokemonPointer+i+constants.pokemonNicknameOffset-1, constants.chars[string.upper(newPokemonData.name:sub(i,i))])
    end
    memory.writebyte(pokemonPointer+constants.pokemonNicknameOffset+#newPokemonData.name, 0xFF)
    
    overwriteSpeciesData(newPokemonData, baseStats)

    nextPokemonId = nextPokemonId + 1

    return nextPokemonId - 1
end

function overwriteSpeciesData(pokemonData, baseStats)
        -- Write the species name
        for i=1,#pokemonData.name do
            memory.writebyte(constants.pokemonNamesPointer + (constants.pokemonNameSize+1)*nextPokemonId + i-1, constants.chars[string.upper(pokemonData.name:sub(i,i))])
        end
        memory.writebyte(constants.pokemonNamesPointer + (constants.pokemonNameSize+1)*nextPokemonId + #pokemonData.name, 0xFF)
        
        -- write the base stats
        substructureUtils.convertBaseStats(pokemonData, baseStats)
        for i=1,#baseStats do
            memory.writebyte(constants.baseStatsPointer + (nextPokemonId-1)*constants.baseStatsSize + i-1, baseStats[i])
        end
        
        -- remove old moves learnable
        local oldMovesLearnableAddress = memory.readdword(constants.movesetPointers+nextPokemonId*4)
        local currentByte = 0
        while currentByte ~= 0xFF do
            memory.writebyte(oldMovesLearnableAddress, 0xFF)
            oldMovesLearnableAddress = oldMovesLearnableAddress + 1
            currentByte = memory.readbyte(oldMovesLearnableAddress)
        end
        
        -- write the moves learnable
        local newMovesLearnableAddress = memorySearch.findEmptySpace(#pokemonData.moveset*2+1)
        for i=1,#pokemonData.moveset do
            memory.writebyte(newMovesLearnableAddress + (i-1)*2, pokemonData.moveset[i][2])
            memory.writebyte(newMovesLearnableAddress + (i-1)*2 + 1, pokemonData.moveset[i][1])
        end
        memory.writebyte(newMovesLearnableAddress + #pokemonData.moveset*2, 0xFF)
        memory.writedword(constants.movesetPointers+nextPokemonId*4, newMovesLearnableAddress)
        
        -- todo: remove old image. For now, I should just keep track of how large each sprite is and remove that. Calculating the size of the sprite on the fly is hard
        overwritePokemonSprite(nextPokemonId, pokemonData.emotePixels, pokemonData.emotePalette)
end

function overwritePokemonSprite(pokemonId, emotePixels, emotePalette)
    -- write the image
    local baseImageAddress = memorySearch.findEmptySpace(#emotePixels)
    for i=1,#emotePixels do
        memory.writebyte(baseImageAddress+i-1, emotePixels[i])
    end
    memory.writedword(constants.frontSpritePointer+pokemonId*8, baseImageAddress)
    memory.writedword(constants.backSpritePointer+pokemonId*8, baseImageAddress)
    
    -- write the palette
    local basePaletteAddress = memory.readdword(constants.palettePointer+pokemonId*8)
    for i=1,#emotePalette do
        memory.writebyte(basePaletteAddress+i-1, emotePalette[i])
    end
    
    -- write the icon
    --local baseIconAddress = memory.readdword(constants.iconPointers+nextPokemonId*4)
    --for i=0,#newPokemonData.icon*2-1 do
    --    memory.writebyte(baseIconAddress+i, newPokemonData.icon[i%#newPokemonData.icon+1])
    --end
end

function hexStringToByteArray(string)
    array = {}
    for i=1,#string/2 do
        array[#array+1] = tonumber(string:sub(i*2-1,i*2), 16)
    end
    return array
end

M.hexStringToByteArray = hexStringToByteArray
M.overwritePokemon = overwritePokemon
M.overwritePokemonFromPipe = overwritePokemonFromPipe
M.overwriteSpeciesData = overwriteSpeciesData
M.overwritePokemonSprite = overwritePokemonSprite
M.readPipe = readPipe

return M