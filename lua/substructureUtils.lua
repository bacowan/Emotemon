local constants = require 'constants'

local M = {}

function getEncryptionKey(otId, personality)
    return bit.bxor(otId, personality)
end

function getSubstructureOrder(personality)
    return constants.substructureOrders[personality%24]
end

function decrypt(pokemonPointer, encryptionKey, substructureOrder)
    local encryptedData = {}
    for i=1,4 do
        encryptedData[i] = memory.readbyterange(pokemonPointer+constants.dataStructureOffset+(i-1)*constants.substructureSize,constants.substructureSize)
    end
    
    -- decrypt the data
    local decryptedData = {}
    for i=1,4 do
        decryptedData[i] = xor(encryptedData[i], encryptionKey)
    end
    
    -- organize the data
    local growth = decryptedData[indexOf(substructureOrder,constants.G)]
    local attacks = decryptedData[indexOf(substructureOrder,constants.A)]
    local ev = decryptedData[indexOf(substructureOrder,constants.E)]
    local misc = decryptedData[indexOf(substructureOrder,constants.M)]
    
    return growth, attacks, ev, misc
end

function convertSubstructures(input, pokemonId, level, levelUpType, growth, attacks, ev, misc)
    -- attacks
    attacks[1] = bit.band(input.attack1, 0xFF)
    attacks[2] = bit.band(bit.rshift(input.attack1, 8), 0xFF)
    attacks[3] = bit.band(input.attack2, 0xFF)
    attacks[4] = bit.band(bit.rshift(input.attack2, 8), 0xFF)
    attacks[5] = bit.band(input.attack3, 0xFF)
    attacks[6] = bit.band(bit.rshift(input.attack3, 8), 0xFF)
    attacks[7] = bit.band(input.attack4, 0xFF)
    attacks[8] = bit.band(bit.rshift(input.attack4, 8), 0xFF)
    
    -- pps
    attacks[9] = bit.bor(input.pp1)
    attacks[10] = bit.bor(input.pp2)
    attacks[11] = bit.bor(input.pp3)
    attacks[12] = bit.bor(input.pp4)

    -- overwrite the pokemon species
    growth[1] = bit.band(pokemonId, 0xFF)
    growth[2] = bit.rshift(pokemonId, 8)
    
    -- overwrite the exp.
    local exp = levelsToExp[level][levelUpType+2]
    growth[5] = bit.band(exp, 0xFF)
    growth[6] = bit.band(bit.rshift(exp,8),0xFF)
    growth[7] = bit.band(bit.rshift(exp,16),0xFF)
    growth[8] = bit.band(bit.rshift(exp,24),0xFF)
end

function calculateChecksum(unencryptedData)
    sum = 0
    for i=1,#unencryptedData do
        for j=1,#unencryptedData[i],2 do
            sum = sum +
                unencryptedData[i][j] +
                unencryptedData[i][j+1]*0x100
        end
    end
    return bit.band(sum, 0xFFFF)
end

function convertBaseStats(input, baseStats)
    baseStats[7] = input.type1
    baseStats[8] = input.type2
    baseStats[23] = input.ability
    baseStats[24] = input.ability
    baseStats[17] = input.gender
end

function encrypt(substructureOrder, growth, attacks, ev, misc)
    -- create new data to write
    local newUnencryptedData = {}
    newUnencryptedData[indexOf(substructureOrder,constants.G)] = growth
    newUnencryptedData[indexOf(substructureOrder,constants.A)] = attacks
    newUnencryptedData[indexOf(substructureOrder,constants.E)] = ev
    newUnencryptedData[indexOf(substructureOrder,constants.M)] = misc
    
    -- calculate the checksum
    local checksum = calculateChecksum(newUnencryptedData)
    
    -- re-encrypt the data
    local newEncryptedData = {}
    for i=1,4 do
        newEncryptedData[i] = xor(newUnencryptedData[i], encryptionKey)
    end

    return newEncryptedData, checksum
end

M.getEncryptionKey = getEncryptionKey
M.getSubstructureOrder = getSubstructureOrder
M.convertSubstructures = convertSubstructures
M.calculateChecksum = calculateChecksum
M.encrypt = encryptedData
M.convertBaseStats = convertBaseStats

return M