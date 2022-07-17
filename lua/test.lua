-- the nickname of the Bulbasaur in the first slot of your party: correctly updates
console:log(tostring(emu:read8(0x0202428C))) -- prints 188 (for B)
emu:write8(0x0202428C, 214)
console:log(tostring(emu:read8(0x0202428C))) -- prints 214 (for b)

-- the species name "Bulbasaur": doesn't update
console:log(tostring(emu:read8(0x08245F5B))) -- prints 188 (for B)
emu.memory.cart0:write8(0x245F5B, 214)
console:log(tostring(emu:read8(0x08245F5B))) -- prints 188 (for B)