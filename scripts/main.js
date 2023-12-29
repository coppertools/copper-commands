import { world, system } from "@minecraft/server";
import { config } from "./config.js"

let AddonVersion = "1.0";

let Overworld = world.getDimension("overworld");

// Functions
function SendFakePlayerMessage(playerName, message, vanilla) {
    if (vanilla == true) {
        return world.sendMessage(`<${playerName}> ${message}`)
    } else {
        return world.sendMessage(`${playerName}: ${message}`)
    }
}
function SendCopperMessage(player, message) {
    return player.sendMessage(`§6§lCopper§r§7 >>§r ${message}`);
}
function SendStaffMessage(message) {
    world.getAllPlayers().forEach((player) => {
        if (player.hasTag("copper_admin") || player.isOp()) {
            player.sendMessage(`§6§lCopper System§r§7 >>§r ${message}`);
        }
    })
}
function SendCopperKick(player, message, kickedBy) {
    if (kickedBy == undefined) kickedBy = "System";
    Overworld.runCommandAsync(`kick ${player} §6§lCopper§r§7 >>§r Kicked by §e${kickedBy}§r | Reason: §e${message}§r`);
}
function FindPlayer(plrName) {
    let FoundPlayers = []
    world.getAllPlayers().forEach((player) => {
        let plrLower = player.name.toLowerCase();
        let searchPlrLower = plrName.toLowerCase();
        if (plrLower.startsWith(searchPlrLower)) {
            FoundPlayers.push(player);
        }
    });
    return FoundPlayers;
}
function RemoveRanksFromPlayer(player) {
    player.getTags().forEach((tag) => {
        if (tag.startsWith("copperrank_")) {
            system.run(() => { player.removeTag(tag); });
            return;
        };
    });
}

// Script events
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = event;
    if (id == "coppermoderation:unrank" && sourceEntity) {
        RemoveRanksFromPlayer(sourceEntity);
    } else if (id == "coppermoderation:rank" && sourceEntity) {
        system.run(() => { sourceEntity.addTag(`copperrank_${message}`) });
    }
});

// Admin commands
world.beforeEvents.chatSend.subscribe((eventData) => {
    const player = eventData.sender;
    const message = eventData.message;

    if (!player.hasTag("copper_admin") && !player.isOp) return;
    if (!eventData.message.startsWith(config.Command_Prefix)) return;

    let CommandArgs = message.substring(1).split(" ");
    eventData.cancel = true;

    switch (CommandArgs[0]) {
        // Kick player
        case "kick":
            if (CommandArgs[1] && CommandArgs[2]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;
                let PunishmentReason = CommandArgs[2];

                SendCopperKick(TargetPlayerName, PunishmentReason, player.name);
                SendStaffMessage(`§e${player.name}§r is kicking §e${TargetPlayerName}§r for the reason: §e${PunishmentReason}§r`);
                SendCopperMessage(player, `Sending an attempt to kick §e${TargetPlayerName}§r...`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}kick [Player] [Reason]§r`);
            }
            break;
        // Mute player
        case "mute":
            if (CommandArgs[1]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;

                system.run(() => {
                    TargetPlayer[0].addTag("copper_muted");
                });
                SendStaffMessage(`§e${player.name}§r muted §e${TargetPlayerName}§r.`);
                SendCopperMessage(player, `Muting §e${TargetPlayerName}§r...`);
                SendCopperMessage(TargetPlayer, `You were muted by §e${player.name}§r.`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}mute [Player]§r`);
            }
            break;
        case "unmute":
            if (CommandArgs[1]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;

                system.run(() => {
                    if (TargetPlayer[0].hasTag("copper_muted")) TargetPlayer[0].removeTag("copper_muted");
                });
                SendStaffMessage(`§e${player.name}§r ummuted §e${TargetPlayerName}§r.`);
                SendCopperMessage(player, `Unmuting §e${TargetPlayerName}§r...`);
                SendCopperMessage(TargetPlayer, `You were unmuted by §e${player.name}§r.`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}unmute [Player]§r`);
            }
            break;
        // Bans
        case "ban":
            if (CommandArgs[1] && CommandArgs[2]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;
                let PunishmentReason = CommandArgs[2];

                Overworld.runCommandAsync(`scoreboard players set ${TargetPlayerName} Copper_Bans 1`)
                SendStaffMessage(`§e${player.name}§r is banning §e${TargetPlayerName}§r for the reason: §e${PunishmentReason}§r`);
                SendCopperMessage(player, `Sending an attempt to ban §e${TargetPlayerName}§r...`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}ban [Player] [Reason]§r`);
            }
            break;
        case "unban":
            if (CommandArgs[1]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                let TargetPlayerName = TargetPlayer[0].name;
                TargetPlayerName.replaceAll("-", " ");

                Overworld.runCommandAsync(`scoreboard players reset "${TargetPlayerName}" Copper_Bans`)
                SendStaffMessage(`§e${player.name}§r is trying to unban §e${TargetPlayerName}§r`);
                SendCopperMessage(player, `Sending an attempt to unban §e${TargetPlayerName}§r...`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}unban [Full Player Username]§r | The username must be exact! If the username has spaces, you will need to put a dash instead of spaces.`);
            }
            break;
        case "banlist":
            let Bans = [];
            world.scoreboard.getObjective("Copper_Bans").getScores().forEach((banItem) => {
                Bans.push(banItem.participant.displayName);
            });
            SendCopperMessage(player, `List of banned players: ${Bans.toString()}`);
            break;
        // Player ranks
        case "rank":
            if (CommandArgs[1] && CommandArgs[2]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;
                let RankName = CommandArgs[2];

                RemoveRanksFromPlayer(player);
                Overworld.runCommandAsync(`execute as ${TargetPlayerName} run scriptevent coppermoderation:rank ${RankName}`);

                SendStaffMessage(`§e${player.name}§r gave §e${TargetPlayerName}§r the rank §e${RankName}§r`);
                SendCopperMessage(player, `Giving §e${TargetPlayerName}§r the §e${RankName}§r rank...`);
                //SendCopperMessage(TargetPlayer, `You received the §e${RankName}§r rank.`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}rank [Player] [Rank Name]§r`);
            }
            break;
        case "unrank":
            if (CommandArgs[1]) {
                let TargetPlayer = FindPlayer(CommandArgs[1]);
                if (TargetPlayer[0] == undefined) {
                    SendCopperMessage(player, "Sorry, we couldn't find that player.");
                    return;
                }

                let TargetPlayerName = TargetPlayer[0].name;

                RemoveRanksFromPlayer(player);

                SendStaffMessage(`§e${player.name}§r removed §e${TargetPlayerName}§r's rank.'`);
                SendCopperMessage(player, `Removing all ranks from §e${TargetPlayerName}§r...`);
                //SendCopperMessage(TargetPlayer, `You lost your rank.`);
            } else {
                SendCopperMessage(player, `Usage: §c${config.Command_Prefix}unrank [Player]§r`);
            }
            break;
        // About and download commands
        case "about":
            SendCopperMessage(player, `Copper commands, version ${AddonVersion} | Prefix is "${config.Command_Prefix}"`);
            SendCopperMessage(player, `If the addon breaks, add the latest release from GitHub or MCPEDL`);
            SendCopperMessage(player, `If you would like to get the addon for yourself, use ${config.Command_Prefix}download`);
            break;
        case "download":
            SendCopperMessage(player, "MCPEDL: https://mcpedl.com/copper-moderation/");
            SendCopperMessage(player, "GitHub: https://github.com/coppertools/copper-commands");
            break;
        // Command not found, or mistyped
        default:
            SendCopperMessage(player, "Command not found.");
            break;
    }
});

// Normal player stuff
world.beforeEvents.chatSend.subscribe((eventData) => {
    const player = eventData.sender;
    const message = eventData.message;

    // Check if muted
    if (player.hasTag("copper_muted")) {
        SendCopperMessage(player, "You are muted.")
        eventData.cancel = true;
    }

    if (eventData.cancel != true) {
        eventData.cancel = true;
        if (config.Override_All_Chat == true) {
            SendFakePlayerMessage(player.nameTag, eventData.message, config.Vanilla_Chat);
        } else {
            if (player.nameTag != player.name) SendFakePlayerMessage(player.nameTag, eventData.message, config.Vanilla_Chat);
        }
    }
});

// Check players
system.runInterval(() => {
    world.getAllPlayers().forEach((player) => {
        Overworld.runCommandAsync("scoreboard objectives add Copper_Bans dummy");

        // Ranks
        let PlayerHasRank = false;
        player.getTags().forEach((tag) => {
            if (tag.startsWith("copperrank_")) {
                let PlayerRank = tag.substring(11);
                PlayerHasRank = true;
                system.run(() => {
                    player.nameTag = `§l§2${PlayerRank}§r ${player.name}`;
                });
                return;
            };
        });
        if (PlayerHasRank == false) system.run(() => { player.nameTag = player.name });

        // Bans
        if (world.scoreboard.getObjective("Copper_Bans").getScore(player) == 1) {
            if (player.hasTag("copper_admin") && player.isOp()) {
                player.runCommandAsync("scoreboard players reset @s Copper_Bans");
                SendCopperMessage(player, "Someone attempted to ban you, but you are an admin.");
                return;
            };
            SendCopperMessage(player, "You are banned from this server.");
            SendCopperKick(player.name, "You are banned from this server.", "an admin");
        }
    });
}, 20);