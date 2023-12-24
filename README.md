# Copper Moderation
A simple moderation tool for vanilla Minecraft Bedrock! To give players moderation commands, you should read the FAQ or wiki.
We are not affiliated with Mojang. If the addon breaks, you will need to download the latest version from [releases](https://github.com/coppertools/copper-commands/releases/new)

## How to install
All you need to do is import the addon (click the mcaddon or mcpack file to import) and add to your world or realm!

## Commands
All command usage is in [COMMANDS.md](COMMANDS.md).

## Configuration
You may change the addons configuration inside of `scripts/config.js`. Every option states what they do, commented right next to it. You can modify it inside of your `com.mojang/behavior_packs` folder, or in the zip/mcaddon file.

## FAQ
- Can I automatically give players ranks?
Yes, to give ranks the command can be `execute as <PLAYER> run scriptevent coppermoderation:rank <RANK NAME>`, and to remove rank is `execute as <PLAYER> run scriptevent coppermoderation:unrank`.
- How can I change the prefix?
In `scripts/config.js`, you can change `Command_Prefix`'s value to whatever prefix you want! Just make sure it is one character, or it will break things.
- How can I give players permission to use the moderation commands?
You can give a player the `copper_admin` tag using `/tag <player> add copper_admin`. Operators automatically have permission to use moderation commands, even if they don't have the tag.