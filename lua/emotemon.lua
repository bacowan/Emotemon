local constants = require 'constants'

console:log('start')

local statusUpdateTimer = 600
function listenForLiveStatusUpdates()
    statusUpdateTimer = statusUpdateTimer + 1
    if (statusUpdateTimer > 600) then -- 10s
        statusUpdateTimer = 0
        local pipe = io.open(constants.liveStatusRequestFileName, 'w')
        if (pipe ~= nil) then
            pipe.close()
        end
    end
end

function frameUpdate()
    listenForLiveStatusUpdates()
end

callbacks:add("frame", frameUpdate)