local constants = require 'constants'
local pokemonWriter = require 'pokemonWriter'
local serverCommunication = require 'serverCommunication'

local M = {}

function handleBattle(spriteSizes)
    print 'battle start'
    local pokemonCount = getPokemonCount()
    for i=1,pokemonCount do
        pokemonWriter.overwritePokemonFromPipe(spriteSizes, constants.enemyPokemonPointers[i])
    end
end

function getPokemonCount()
    for i=1,6 do
        nickname = memory.readbyterange(constants.enemyPokemonPointers[i]+constants.pokemonNicknameOffset,constants.pokemonNameSize)
        if (tablesEqual(nickname,{0,0,0,0,0,0,0,0,0,0})) then return i-1 end
    end
    return 6
end

M.handleBattle = handleBattle
return M