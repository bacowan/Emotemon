local M = {}

-- xor a table of bytes with a double word repeatedly
function xor(byteTable, val)
    valTable = {
        bit.band(val,0xFF),
        bit.ror(bit.band(val,bit.rol(0xFF,8)), 8),
        bit.ror(bit.band(val,bit.rol(0xFF,16)), 16),
        bit.ror(bit.band(val,bit.rol(0xFF,24)), 24)
    }
    ret = {}
    for i=1,#byteTable do
        ret[i] = bit.bxor(byteTable[i], bit.bxor(valTable[(i-1)%4+1]))
    end
    return ret
end

function indexOf(table, val)
    for i=1,#table do
        if table[i] == val then
            return i
        end
    end
    return 0
end

-- via http://lua-users.org/wiki/LuaCsv
function parseCSVLine (line,sep) 
	local res = {}
	local pos = 1
	sep = sep or ','
	while true do 
		local c = string.sub(line,pos,pos)
		if (c == "") then break end
		if (c == '"') then
			local txt = ""
			repeat
				local startp,endp = string.find(line,'^%b""',pos)
				txt = txt..string.sub(line,startp+1,endp-1)
				pos = endp + 1
				c = string.sub(line,pos,pos) 
				if (c == '"') then txt = txt..'"' end
			until (c ~= '"')
			table.insert(res,txt)
			assert(c == sep or c == "")
			pos = pos + 1
		else
			local startp,endp = string.find(line,sep,pos)
			if (startp) then 
				table.insert(res,string.sub(line,pos,startp-1))
				pos = endp + 1
			else
				table.insert(res,string.sub(line,pos))
				break
			end 
		end
	end
	return res
end

M.xor = xor
M.indexOf = indexOf
M.parseCSVLine = parseCSVLine

return M