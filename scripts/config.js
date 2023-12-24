export let config = {
    // Commands
    "Command_Prefix": ";", // The prefix that admins use in-game

    // Preferences
    "Allow_Bans": true, // Even if this option is disabled, operators can always ban using the command.
    "Vanilla_Chat": true, // This option makes chat message format look no different from vanilla. If you turn this to false, it will be "[NAME]: [MESSAGE]"
    "Override_All_Chat": true, // This option will recreate chat messages using /tellraw, turning this off will make it so only players with ranks will have their chat messages sent via /tellraw.
}