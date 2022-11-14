---
title: Untrack
---

# Untrack

Remove a project from tracking. Also useful if you want to change what channel the project's updates are posted to.

## Command

`/untrack [project_id] [channel]`

Removes project(s) from tracking.
- Specifying **both a project ID and channel** will untrack that project in the specified channel.
- Specifying a **project ID without a channel** will untrack that project in every channel it's tracked in.
- Specifying a **channel without a project ID** will untrack all projects in that channel.
- Providing neither parameter will untrack all projects in the server. As this is a potentially destructive action, the bot will ask for confirmation before doing this.

:::tip

You can get a project's ID from its project page on the Modrinth or CurseForge website, or by using the [Search](../search) command.

:::
