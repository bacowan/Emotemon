local constants = require 'constants'
local battleHandler = require 'battleHandler'
local memorySearch = require 'memorySearch'
local pokemonWriter = require 'pokemonWriter'

print 'script running'

local currentBattleType = 0

-- todo: there's a memory.registerwrite function that's probably more efficient
function battleStarting()
    local battleType = memory.readbyte(constants.battleTypePointer)

    if (battleType ~= currentBattleType and (battleType == constants.battleTypes["wild"] or battleType == constants.battleTypes["trainer"] or battleType == constants.battleTypes["rival"])) then
        currentBattleType = battleType
        return true
    end
    currentBattleType = battleType
    return false
end

local hasPartyMember = false

-- todo: there's a memory.registerexec function that's probably more efficient
function getStarter()
    if (hasPartyMember ~= true) then
        local firstPartyLanguage = memory.readword(constants.partyPokemonPointers[1] + constants.languageOffset)
        if firstPartyLanguage ~= 0 then
            hasPartyMember = true
            return true
        else
            return false
        end
    else
        return false
    end
end

function onFrame()
    if battleStarting() then
        battleHandler.handleBattle()
    elseif getStarter() then
        pokemonWriter.overwritePokemon(constants.partyPokemonPointers[1])
    end
end

function setupStarters()
    -- the three starter pokemon will appear as the twitch glitch until you select one
    local f = io.open(constants.defaultEmoteFileName, 'r')
    io.input(f)

    local pixels = io.read("*l")
    local palette = io.read("*l")

    io.close(f)

    local pixelsString = pokemonWriter.hexStringToByteArray(pixels)
    local paletteString = pokemonWriter.hexStringToByteArray(palette)

    pokemonWriter.overwritePokemonSprite(constants.bulbasaurOffset, pixelsString, paletteString)
    pokemonWriter.overwritePokemonSprite(constants.charmanderOffset, pixelsString, paletteString)
    pokemonWriter.overwritePokemonSprite(constants.squirtleOffset, pixelsString, paletteString)
end

setupStarters()

gui.register(onFrame)