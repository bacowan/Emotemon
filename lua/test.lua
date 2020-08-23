local wildPokemonBattleFunction = 0x08010672
local bulbasaurPalettePointer = 0x08237384
local bulbasaurPalette = 0x08D2FE78
local battleTypePointer = 0x02022B4C

print 'script running'

currentBattleType = 0

function run()
    print 'battle start'

    f = io.open('\\\\.\\pipe\\doomred', 'r')
    io.input(f)
    bytes = io.read("*l")
    io.close(f)
    print(bytes)
    byteArray = hexStringToByteArray(bytes)

    for i=1,#byteArray do
        memory.writebyte(bulbasaurPalette+i-1, byteArray[i])
    end
    
end

function hexStringToByteArray(string)
    array = {}
    for i=1,#string/2 do
        array[#array+1] = tonumber(string:sub(i*2-1,i*2), 16)
    end
    return array
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
