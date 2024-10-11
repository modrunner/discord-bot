# Contributing to Modrunner

So you wanna contribute to Modrunner, eh? Cool!

Below are some guidelines (not rules) to keep in mind when developing for Modrunner.

## I just have a question...

That's cool! However, questions are best asked in our [Discord](https://discord.gg/HZMCRNUd5Z). You don't really need to
make a new issue for them (though we will still respond if you do).

There also a few community resources that may help to point you in the right direction if you are confused:

- [Modrunner Docs](https://modrunner.net/docs)
- [Modrunner FAQs](https://modrunner.net/docs/faq)

## Things to know/do before getting started

### The term "Modrunner"

When we refer to "Modrunner" in the context of this repository, we are talking about the discord bot application. If you want to contribute to other parts of "Modrunner", be sure to check out the contributing guidelines in their respective repositories. All of these are open for contribution, but just be sure which one you want to be working on before you start.

### Design choices and development

Modrunner does not particularly follow a standard or have an official process of software development. However, be aware
that if your goal when contributing is to significantly alter the structure or tech stack of the application, know that
your changes will more than likely be rejected unless you've talked to us personally to justify your changes. We are not
interested in radically altering our project unless it has some significant benefit to the short or long-term success of
the project.

### Co-development

You don't need to talk to us before opening a pull request, but doing so is still a good idea, particularly if you intend
on implementing new features or refactoring major systems. Starting your contribution can be as simple as opening a pull
request with your proposed changes and stating you intend to implement them yourself or with the help of the Modrunner
team. You can also talk with us in [Discord](https://discord.gg/HZMCRNUd5Z) to help facilitate quicker and more responsive
development.

## How can I contribute?

### Reporting bugs

This probably the number one way issues with Modrunner get solved. Oftentimes, issues can go unnoticed during development,
and due to the nature of Modrunner's functionality and its small dev team, covering all cases can be a challenge. Letting
us know of issues you have encountered, along with any additional information you can provide, will assist the Modrunner
team immensely in dealing with bugs as they pop up.

The best way to submit reports is to open a new issue. This allows the team to easily keep track of new bugs and related
information that will assist in tracking it down and fixing it. Otherwise, reporting them in our
[Discord](https://discord.gg/HZMCRNUd5Z) is also perfectly fine.

#### How to submit a good bug report

Easy-peasy: just use one of the pre-existing bug report templates listed when you click the "New Issue" button. They are
pre-filled with fields that will help the Modrunner team in dealing with the issue effectively and promptly.

## Suggesting new features or updates

Got a neat idea for Modrunner? Awesome, we'd love to hear about it. Making an issue with your proposal or posting about
it in our [Discord](https://discord.gg/HZMCRNUd5Z) are both valid ways to get us to hear about it.

## Your first code contribution

If you're unsure of where to start, consult [Modrunner Roadmap](https://github.com/users/smcmo/projects/11). There we have listed
tasks that are currently in the backlog, planned for implementation, currently being implemented and tasks which have been
finished. **It is highly recommended that you check this project to avoid performing work on a task that has already been done,
or currently being worked on**, particularly if you are implementing new features or fixing bugs.

### Setting up your local development environment

#### Modrunner Bot

To get started ensure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed.

1. Fork the repository to your own GitHub account by using the `Fork` button in the top right (you will need your own GitHub account for this, obviously).
2. Clone the fork to your local machine and open it in your editor or IDE of choice. Visual Studio Code is a great choice.
3. Install the required dependencies by running `npm install` in your console.
4. Make any desired changes to the code and save it.
5. To test your changes, you will need your own Discord bot client application.

   1. Log into the [Discord Developer Portal](https://discord.com/developers).
   2. Create a new application. Give a name like `Testing Bot`.
   3. Head to the `Bot` tab and click `Add Bot`.
   4. Click `Reset Token` and copy the new token generated. The token will only be shown once, so make sure to save it somewhere safe.

6. You will need a system for storing secrets. I use [Doppler](https://www.doppler.com/) but a simpler solution like
   [Dotenv](https://www.npmjs.com/package/dotenv) will also work. You will need five different secret fields:

   - `CURSEFORGE_API_KEY`: See [obtaining a CurseForge API key](#obtaining-a-curseforge-api-key).
   - `DISCORD_APPLICATION_ID`: The ID of your bot application. You can get this from the developer dashboard under General Information.
   - `DISCORD_DEVELOPMENT_GUILD_ID`: A Discord server ID to use for testing the bot. You can get this by enabling Developer Mode in settings,
     then right-clicking on the server icon and choosing Copy ID.
   - `DISCORD_TOKEN`: This is the token from the Discord developer dashboard that you copied earlier.
	 - `LOGGING_LEVEL`: Sets the bot's logging level. For more information see [the pino docs](https://getpino.io/#/).
   - `MODRUNNER_API_KEY`: A string used to access the API. I recommend using a randomly generated string at least 16 characters in length.
	 - `OPENAI_API_KEY`: See [obtaining an OpenAI API key](#obtaining-an-openai-api-key)
	 - `SERVER_PORT`: The port number you want the API server hosted on. Something like **3000** will work.
   

7. Now you're ready to being testing your changes! Here's a quick overview of the npm scripts.
   1. Before starting the bot for the first time, type `npm run register` and `npm run create-db` into your console. This will register the bot's commands to the development guild listed for `DISCORD_DEVELOPMENT_GUILD_ID`, and will create the database file in `/database`.
   2. Now you can run `npm run start`. This will start the bot and log it into Discord. You can also use `npm run dev`, which will auto-restart the bot when any code changes are detected.
8. Once you're satisfied with your changes, commit your changes and open a pull request to `modrunner/discord-bot` to merge your changes.

##### Obtaining a CurseForge API Key

1. Log into the [CurseForge Core Console](https://console.curseforge.com/#/).
2. Go to **API keys**.
3. Copy the key listed under your username. Be sure to keep this a secret!

##### Obtaining an OpenAI API Key

1. Log into the [OpenAI Dev Portal](https://platform.openai.com/login).
2. Go to **API**.
3. Click on your profile icon in the top right and go to **View API Keys**
4. Click **Create New Secret Key**, give the key a name, then copy it.

### Style guide

#### Code

Modrunner uses [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/) for code formatting and error checking.
While we don't deny your pull request if you don't use these, it is recommended that you do to ensure consistent
formatting and error-free code while developing.

#### Commits

Please make sure to make your commit messages accurate and descriptive. Otherwise, we don't enforce a particular style of commit message.
