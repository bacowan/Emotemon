local constants = require 'constants'
local substructureUtils = require 'substructureUtils'
local memorySearch = require 'memorySearch'

local M = {}

local nextPokemonId = 1

function handleBattle()
    print 'battle start'
    local pokemonCount = getPokemonCount()
    for i=1,pokemonCount do
        overwritePokemon(constants.enemyPokemonPointers[i])
    end
end

function getPokemonCount()
    for i=1,6 do
        nickname = memory.readbyterange(constants.enemyPokemonPointers[i]+constants.pokemonNicknameOffset,constants.pokemonNameSize)
        if (tablesEqual(nickname,{0,0,0,0,0,0,0,0,0,0})) then return i-1 end
    end
    return 6
end

function tablesEqual(t1,t2)
    if (#t1~=#t2) then return false end
    for i=1,#t1 do
        if (t1[i] ~= t2[i]) then
            return false
        end
    end
    return true
end

function overwritePokemon(pokemonPointer)

    local rawData = readPipe()
    local newPokemonData = formatRawPokemonData(rawData)
    
    local personality = memory.readdword(pokemonPointer)
    local otId = memory.readdword(pokemonPointer+constants.otIdOffset)
    local encryptionKey = substructureUtils.getEncryptionKey(otId, personality)
    local substructureOrder = substructureUtils.getSubstructureOrder(personality)
    local growth, attacks, ev, misc = substructureUtils.decrypt(pokemonPointer, encryptionKey, substructureOrder)
    
    -- read in the base stats
    local baseStats = memory.readbyterange(constants.baseStatsPointer + (nextPokemonId-1)*constants.baseStatsSize, constants.baseStatsSize)
    
    -- overwrite the substructres with the input data
    level = memory.readbyte(pokemonPointer+constants.levelOffset)
    levelUpType = memory.readbyte(constants.baseStatsPointer + (nextPokemonId-1)*28 + 19) -- TODO: what do these magic numbers mean?
    substructureUtils.convertSubstructures(newPokemonData, nextPokemonId, level, levelUpType, growth, attacks, ev, misc)
    
    -- write the encrypted data
    local encryptedData, checksum = substructureUtils.encrypt(substructureOrder, growth, attacks, ev, misc, encryptionKey)
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
    
    -- Write the species name
    for i=1,#newPokemonData.name do
        memory.writebyte(constants.pokemonNamesPointer + (constants.pokemonNameSize+1)*nextPokemonId + i-1, constants.chars[string.upper(newPokemonData.name:sub(i,i))])
    end
    memory.writebyte(constants.pokemonNamesPointer + (constants.pokemonNameSize+1)*nextPokemonId + #newPokemonData.name, 0xFF)
    
    -- write the base stats
    substructureUtils.convertBaseStats(newPokemonData, baseStats)
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
    local newMovesLearnableAddress = memorySearch.findEmptySpace(#newPokemonData.moveset*2+1)
    for i=1,#newPokemonData.moveset do
        memory.writebyte(newMovesLearnableAddress + (i-1)*2, newPokemonData.moveset[i][2])
        memory.writebyte(newMovesLearnableAddress + (i-1)*2 + 1, newPokemonData.moveset[i][1])
    end
    memory.writebyte(newMovesLearnableAddress + #newPokemonData.moveset*2, 0xFF)
    memory.writedword(constants.movesetPointers+nextPokemonId*4, newMovesLearnableAddress)
    
    -- remove old image
    -- todo. For now, I should just keep track of how large each sprite is and remove that. Calculating the size of the sprite on the fly is hard
    
    -- write the image
    local baseImageAddress = findEmptySpace(#newPokemonData.emotePixels)
    for i=1,#newPokemonData.emotePixels do
        memory.writebyte(baseImageAddress+i-1, newPokemonData.emotePixels[i])
    end
    memory.writedword(constants.frontSpritePointer+nextPokemonId*8, baseImageAddress)
    memory.writedword(constants.backSpritePointer+nextPokemonId*8, baseImageAddress)
    
    -- write the palette
    local basePaletteAddress = memory.readdword(constants.palettePointer+nextPokemonId*8)
    for i=1,#newPokemonData.emotePalette do
        memory.writebyte(basePaletteAddress+i-1, newPokemonData.emotePalette[i])
    end
    
    -- write the icon
    --local baseIconAddress = memory.readdword(constants.iconPointers+nextPokemonId*4)
    --for i=0,#newPokemonData.icon*2-1 do
    --    memory.writebyte(baseIconAddress+i, newPokemonData.icon[i%#newPokemonData.icon+1])
    --end
end

function formatRawPokemonData(rawData)
    local ret = {}
    ret.name = rawData.name
    ret.attack1 = tonumber(rawData.attack1)
    ret.attack2 = tonumber(rawData.attack2)
    ret.attack3 = tonumber(rawData.attack3)
    ret.attack4 = tonumber(rawData.attack4)
    ret.pp1 = tonumber(rawData.pp1)
    ret.pp2 = tonumber(rawData.pp2)
    ret.pp3 = tonumber(rawData.pp3)
    ret.pp4 = tonumber(rawData.pp4)
    ret.type1  = tonumber(rawData.type1 )
    ret.type2 = tonumber(rawData.type2)
    ret.ability = tonumber(rawData.ability)

    if rawData.gender == "0" then
        ret.gender = 0 -- male
    elseif rawData.gender == "1" then
        ret.gender = 1 -- female
    else
        ret.gender = 255
    end

    ret.moveset = {}
    local levelIndex = string.find(rawData.movesLearnable, "L")
    while levelIndex ~= nil do
        local moveIndex = string.find(rawData.movesLearnable, "M", levelIndex)
        local endIndex = string.find(rawData.movesLearnable, "E", levelIndex)

        local levelValue = tonumber(rawData.movesLearnable:sub(levelIndex + 1, moveIndex - 1))
        local moveValue = tonumber(rawData.movesLearnable:sub(moveIndex + 1, endIndex - 1))

        table.insert(ret.moveset, {levelValue * 2, moveValue})

        local levelIndex = string.find(rawData.movesLearnable, "L", levelIndex + 1)
    end
    
    ret.emotePixels = hexStringToByteArray(rawData.emotePixels)
    ret.emotePalette = hexStringToByteArray(rawData.emotePalette)

    return ret
end

function readPipe()
    local f = io.open(constants.fileName, 'r')
    io.input(f)

    local ret = {}

    ret.name = io.read("*l")

    if (ret.name == "0") then
        return nil
    end

    ret.attack1 = io.read("*l")
    ret.attack2 = io.read("*l")
    ret.attack3 = io.read("*l")
    ret.attack4 = io.read("*l")
    ret.pp1 = io.read("*l")
    ret.pp2 = io.read("*l")
    ret.pp3 = io.read("*l")
    ret.pp4 = io.read("*l")
    ret.ability = io.read("*l")
    ret.gender = io.read("*l")
    ret.type1 = io.read("*l")
    ret.type2 = io.read("*l")
    ret.movesLearnable = io.read("*l")
    ret.emotePixels = io.read("*l")
    ret.emotePalette = io.read("*l")
    io.close(f)

    return ret
end

function hexStringToByteArray(string)
    array = {}
    for i=1,#string/2 do
        array[#array+1] = tonumber(string:sub(i*2-1,i*2), 16)
    end
    return array
end


M.handleBattle = handleBattle
return M