local constants = require 'constants'

local M = {}

function findEmptySpace(length)
    emptyByteCount = 0
    
    offset = constants.romStartAddress
    while offset < constants.romEndAddress do
        if memory.readbyte(offset) == 0xFF then
            if emptyByteCount == length + 2*constants.surroundingBlankSpace then
                return offset - emptyByteCount + constants.surroundingBlankSpace
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

M.findEmptySpace = findEmptySpace

return M