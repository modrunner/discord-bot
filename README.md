# Modrunner Discord Bot
![Discord](https://img.shields.io/discord/764169561003130881?color=%237289DA&logo=discord&style=for-the-badge)

## Overview
[![forthebadge](https://forthebadge.com/images/badges/contains-tasty-spaghetti-code.svg)](https://forthebadge.com)

Search for projects on Modrinth and CurseForge & get notified of updates to tracked projects, right from Discord.

![](https://1648105728-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FYW466levrF1kDXDbfbGG%2Fuploads%2Fk7QILDqgwvDM3rlT6giC%2Fimage.png?alt=media&token=f30d873f-c7bd-4cac-8830-06fb15cc5321)

Modrunner is a Discord bot that allows server members to search for projects on CurseForge and Modrinth, and server admins to track changes to projects on these platforms, and get notified whenever a tracked projec recieves an update.

![](https://1648105728-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FYW466levrF1kDXDbfbGG%2Fuploads%2FbeXlMgW6zEY0HmL4jwzR%2Fimage.png?alt=media&token=3e0e7829-d12f-4312-b635-8ab4b509a4ce)

## Features
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)

Modrunner is currently in **open beta**. This means that while most of the bot's functions have been tested, they may still contain bugs, or many not be 100% complete.

[A wiki is available](https://beansquared.gitbook.io/modrunner-wiki/), detailing how to use the bot's commands and some FAQs.

Here's some of the features that are completed or mostly completed:
- Modrinth search: find projects on Modrinth and get basic information on them, posted right into Discord
- Modrinth tracking: add Modrinth projects to tracking and get notified whenever the authors of these projects upload new files
- CurseForge search: find projects on CurseForge and get basic information on them, posted right into Discord
- CurseForge tracking: add CurseForge projects to tracking and get notified whenever the authors of these projects upload new files

For the most up-to-date information on the state of Modrunner's development, check out the [Trello board](https://trello.com/b/tNrFYngk).

## Accessing Modrunner
[![forthebadge](https://forthebadge.com/images/badges/for-you.svg)](https://forthebadge.com)

To try Modrunner out for yourself, you can invite the bot to your server using [this invite link](https://discord.com/api/oauth2/authorize?client_id=978413985722404924&permissions=2048&scope=bot%20applications.commands).

## Server Hosting
Bisect Hosting offers high-quality, affordable servers with great customer support for whatever project you need. Most known for their Minecraft Java Edition multiplayer servers, they also provide game servers for a wide variety of other games, as well as web hosting and virtual private servers (VPS). Did you know Modrunner is hosted on a Bisect Hosting VPS? It's true!

As an Bisect Hosting partner, when you purchase a server using my affiliate code **beansquared**, you can get **25% your first month**, and you support me directly as well.

![](https://www.bisecthosting.com/partners/custom-banners/fc72f588-888d-452c-8d66-6efd45d2882c.png)

## Licensing
![GitHub](https://img.shields.io/github/license/beans-squared/modrunner-bot?style=for-the-badge)

Modrunner is licensed under the **Apache License 2.0**. This means you can use the source for commercial use, modify it, distribute it, etc. The main conditions are:
- You cannot use the name 'Modrunner', the Modrunner logo, or related Modrunner branding and artwork to title or describe your spinoff work, you must use your own branding or trademarks, and
- You must document any major changes to the original work (a commit history in a publicly available repo would work)

Also if you do use these source for your own projects, I'd love to hear about it!

## Contributing
![GitHub last commit](https://img.shields.io/github/last-commit/beans-squared/modrunner-bot?style=for-the-badge)

Any contributions, big or small, are welcome! To get started:

1. Fork the repository to your own GitHub account by using the `Fork` button in the top right (you will need your own GitHub account for this, obviously).
2. Clone the fork to your local machine and open it in your editor or IDE of choice. Visual Studio Code is a great choice.
3. Make any desired changes to the code and save it.
4. To test your changes, you will need your own Discord bot client application, as well as a couple of `.json` files that are not included with the repository by default due to security reasons.
    1. Log into the [Discord Developer Portal](https://discord.com/developers).
    2. Create a new application. Give a name like `Testing Bot`.
    3. Head to the `Bot` tab and click `Add Bot`.
    4. Return to your editor and create a file named `config.json` in the root directory. It will need to formatted like this:
    ```
   {
		"clientId": "<YOUR-BOT'S-CLIENT-ID>",
		"guildIds": [
			<LIST-OF-GUILD-IDS>
		],
		"token": "<YOUR-BOT'S-SECRET-TOKEN>",
		"env": "dev"
    }
   ```
   - `clientId` is the ID of your bot's account. You can copy this from the `General Information` tab in the developer portal.
   - `guildIds` is an array of guild IDs that you wish to use for testing commands. You more than likely will not need to list more than one.
   - `token` is your bot's secret token used by your bot to authenticate and log into Discord. To get a token, navigate to the `Bot` tab in the developer portal, and click `Reset Token`. This will generate a new token that you can then copy over. **Be sure to keep this token a secret!**
   - `env` is used to determine the bot's logging level and output location. When set to `dev` it will output logs to the console and run at `trace` level. When set to `prod` it will output to the `bot.log` file in the root directory and run at `info` level. For more information see the [Pino documentation](https://getpino.io/#/docs/api?id=logger-level).
5. For testing API calls, you will also need to create an `api_config.json` under `/api`, formatted like so:
    ```
   {
		"api_max_retries": 3,
		"cf_base_url": "https://api.curseforge.com/v1",
		"cf_api_key": "<YOUR-CURSEFORGE-API-KEY>",
		"modrinth_base_url": "https://api.modrinth.com/v2",
		"modrinth_user_agent": "<github-username>/modrunner-bot/<version> (modrunner.net)"
    }
   ```
   - `api_max_retries` controls how many times the bot will retry a failed API call. Leave this at `3` unless you have a good reason to change it.
   - `cf_base_url` and `modrinth_base_url` controls which versions of the APIs to use for CurseForge and Modrinth. Don't change these unless you know what you are doing.
   - `cf_api_key` is the API key used to gain access to CurseForge's API. To get your own, visit the [CurseForge Core Console](https://console.curseforge.com/#/), log in or create an account, head to the `API Keys` tab and copy the key listed under your username.
   - `modrinth_user_agent` is used to identify the bot's traffic to Modrinth. Set this to `<github-username>/modrunner-bot/<version> (modrunner.net)`. If you don't know the version you can just omit that part.
6. Now you're ready to being testing your changes! Here's a quick overview of the npm scripts.
    1. Before starting the bot for the first time, type `npm run register` and `npm run dbInit` into your console. This will register the bot's commands to all guilds listed under `guildIds` in your `config.json`, and will create the `database.sqlite` file in the project's root directory.
    2. Now you can run `npm run start`. This will start the bot and log it into Discord.
7. Once you're satisfied with your changes, commit your changes and open a pull request to `beans-squared/modrunner-bot` to merge your changes.

If you have any questions, come talk to us in our [Discord](https://discord.gg/HZMCRNUd5Z).
If you need ideas, check out the [Trello board](https://trello.com/b/tNrFYngk).

## Supporting
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)

Modrunner is currently developed under the creative direction of the CyberSmiths Guild, a development team currently only comprised of a single member, beansquared. beansquared is a full time university student studying computer science in the United States. As such, any monetary contributions you feel are appropriate to make will be greatly appreciated and will make beansquared very happy. beansquared will now stop talking in the third person because that's kind of weird.

- [BuyMeACoffee](https://www.buymeacoffee.com/beansquared)

Note: You will not receive any special treatments or rewards from donations, other than warm fuzzies for being a generous person :)

## Community and Support
![](https://discordapp.com/api/guilds/764169561003130881/widget.png?style=banner4)