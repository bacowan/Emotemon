local wildPokemonBattleFunction = 0x08010672
local bulbasaurPalettePointer = 0x08237384
local battleTypePointer = 0x02022B4C

print 'script running'

currentBattleType = 0

function run()
    print 'battle start'
    memory.writebyte(bulbasaurPalettePointer, 0xE8)
    memory.writebyte(bulbasaurPalettePointer+1, 0x08)
    memory.writebyte(bulbasaurPalettePointer+2, 0xD3)
    memory.writebyte(bulbasaurPalettePointer+3, 0x08)
    memory.writebyte(bulbasaurPalettePointer+4, 0x02)
    memory.writebyte(bulbasaurPalettePointer+5, 0x00)
    memory.writebyte(bulbasaurPalettePointer+6, 0x00)
    memory.writebyte(bulbasaurPalettePointer+7, 0x00)
end

function battleStarting()
    battleType = memory.readbyte(battleTypePointer)
    if battleType ~= currentBattleType and currentBattleType == 0 or currentBattleType == 8 then
        currentBattleType = battleType
        return true
    end
    currentBattleType = battleType
    return false
end

function onFrame()
    if battleStarting() then
        run()
    end
end
gui.register(onFrame)
--memory.registerexec(wildPokemonBattleFunction,run)