# DoomRedV2
Doom Red but with Crowd Control

# How it works (i.e. is planned on working)
Same as V1 but with some key differences
- it runs in Bizhawk which can't edit ROM values. Therefore, you have to apply a patch to the game first which overwrites the pointers to pokemon values and repoints them to RAM. This is where pokemon values are now written
- there are no read triggers (V1 could read every frame and send a message when a battle started. The best CC is currently able to do is poll). The way V2 does it is by waiting for a battle to end. After a battle ends (and at some point before the very first battle starts) it hard codes the value of the current enemy pokemon as an increment. That way the next pokemon to be encountered will already be set. When a battle starts, the number of party pokemon is read and then overwritten, similar to how V1 acts
