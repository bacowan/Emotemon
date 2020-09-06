local constants = require 'constants'

local M = {}

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

function formatRawPokemonData(rawData)
    local ret = {}
    ret.name = rawData.name:sub(0,10)
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

M.readPipe = readPipe
M.formatRawPokemonData = formatRawPokemonData

return M