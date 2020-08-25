local wildPokemonBattleFunction = 0x08010672
local bulbasaurPalettePointer = 0x08237384
local bulbasaurSpritePointer = 0x082365C4
local bulbasaurPalette = 0x08EC24B0--0x08D2FE78
local bulbasaurSprite = 0x08FBD6A0--0x08D305AC
local battleTypePointer = 0x02022B4C
local romStartAddress = 0x08000000
local romEndAddress = 0x09FC03FF
local surroundingBlankSpace = 0

print 'script running'

currentBattleType = 0

function run()
    print 'battle start'

    f = io.open('\\\\.\\pipe\\doomred', 'r')
    io.input(f)

    emotePixels = io.read("*l")
    if #emotePixels == 0 then
        return
    end
    emotePalette = io.read("*l")
    if #emotePalette == 0 then
        return
    end

    io.close(f)
    print(emotePixels)
    print(emotePalette)
    emotePaletteByteArray = hexStringToByteArray(emotePalette)
    emotePixelsByteArray = hexStringToByteArray(emotePixels)

    memory.writebyte(bulbasaurPalettePointer, 0xB0)
    memory.writebyte(bulbasaurPalettePointer+1, 0x24)
    memory.writebyte(bulbasaurPalettePointer+2, 0xEC)
    memory.writebyte(bulbasaurPalettePointer+3, 0x08)

    memory.writebyte(bulbasaurSpritePointer, 0xA0)
    memory.writebyte(bulbasaurSpritePointer+1, 0xD6)
    memory.writebyte(bulbasaurSpritePointer+2, 0xFB)
    memory.writebyte(bulbasaurSpritePointer+3, 0x08)

    for i=1,#emotePaletteByteArray do
        memory.writebyte(bulbasaurPalette+i-1, emotePaletteByteArray[i])
    end

    for i=1,#emotePixelsByteArray do
        memory.writebyte(bulbasaurSprite+i-1, emotePixelsByteArray[i])
    end
    
end

function hexStringToByteArray(string)
    array = {}
    for i=1,#string/2 do
        array[#array+1] = tonumber(string:sub(i*2-1,i*2), 16)
    end
    return array
end

function findEmptySpace(length)
    emptyByteCount = 0
    
    offset = romStartAddress
    while offset < romEndAddress do
        if memory.readbyte(offset) == 0xFF then
            if emptyByteCount == length + 2*surroundingBlankSpace then
                return offset - emptyByteCount + surroundingBlankSpace
            end
            emptyByteCount = emptyByteCount + 1
            offset = offset + 1
        else
            emptyByteCount = 0
            offset = offset + 4-(offset%4)
        end
    end
    print('no empty space found!')
end

function battleStarting()
    battleType = memory.readbyte(battleTypePointer)
    if (battleType ~= currentBattleType and battleType ~= 28) and (currentBattleType == 0 or currentBattleType == 8) then
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
