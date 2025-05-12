# Changelog

## \[1.5.1] (2025-05-09)

- Fixed notifications for tracked Modrinth projects sometimes not showing or not showing at the correct time

## \[1.5.0] (2024-12-23)

- Added a new "alt" notification style which displays changelogs in plaintext in the notification embed

## \[1.4.10] (2024-09-19)

- Another possible fix for Modrinth project notifications not being sent

## \[1.4.9] (2024-09-16)

- Possible fix for notifications not being sent for Modrinth projects

## \[1.4.8] (2024-08-24)

- Fix notifications being sent for incorrect Modrinth versions

## \[1.4.7] (2024-01-04)

- Migrate the AI model used for AI-generated notifications from `text-davinci-003` to `gpt-3.5-turbo` ([#126](https://github.com/modrunner/discord-bot/issues/126))

## \[1.4.6] (2024-01-02)

- Fix a security exploit that allowed any user to manage tracked projects and settings for servers they don't have server management permissions in

## \[1.4.5] (2023-12-12)

- Added a temporary fix for a crash caused by the bot attempting to post notifications to a forum channel that requires tags to post ([#109](https://github.com/modrunner/discord-bot/issues/109))
  - Notifications will not work in forum channels unless the tag requirement for new posts is disabled
- Added a check that updates project names in the database during the update checking cycle ([#115](https://github.com/modrunner/discord-bot/issues/115))
- Fixed a crash caused by the bot not properly truncating excessively long changelogs ([#111](https://github.com/modrunner/discord-bot/issues/111))
- Fixed a bug that allowed users to track more projects than their server's tracked project limit

## \[1.4.4] (2023-10-24)

- Fixed an issue that prevented the bot from sending update notifications for some projects

## \[1.4.3] (2023-10-12)

- Fixed an issue preventing the update check cycle from reading the database correctly

## \[1.4.2] (2023-10-12)

- Added "AI" type notifications (beta release) ([#c227d1a](https://github.com/modrunner/discord-bot/commit/c227d1a1ececd117233eb956a28c927aef4f42de))
- Fixed incorrect spelling of "CurseForge on update notification embeds ([#93](https://github.com/modrunner/discord-bot/issues/93))"
- Fixed several critical bugs

## \[1.3.3] (2023-05-16)

- Fixed occasional error when tracking projects

## \[1.3.2] (2023-02-11)

- Fixed projects without uploaded files causing an error state

## \[1.3.1] (2023-02-06)

- Fixed nonexisting Modrinth project causing a restart loop

## \[1.3.0] (2022-12-21)

- Added the ability to add roles to tracked projects to ping members with that role then an update notification is posted
- Added support for notifications in forum channels
- Added a check for appropriate permissions to be able to post notifications in a channel
- Fixed capitalization bug on modrinth project update notifications
- Fixed project icon not showing on update notifications

## \[1.2.6] (2022-11-28)

- Fixed Notifications being sent for previous project updates

## \[1.2.5] (2022-11-28)

- Fixed capitalization bug on CurseForge project update notifications

## \[1.2.4] (2022-11-27)

- Fixed missing notifications for updated CurseForge projects

## \[1.2.3] (2022-11-19)

- Added checks for tracked projects in deleted channels in `list` command and update check cycle
- Added sweepers for stale database data

## \[1.2.2] (20220-11-15)

- Added some minor error handling for more graceful handling of failed API calls

## \[1.2.1] (2022-11-14)

- Fixed posting notifications for old updates for CurseForge projects

## \[1.2.0] (2022-11-14)

- Added `/settings` command to replace `/mode` command
- Added new `projectid` and `channel` parameters to `/untrack` for more control over project tracking
- Added new `channel` parameter to `/list` for filtering tracked projects by channel
- Added limit on the number of tracked projects allowed for a single guild

- Changed internal database structure
- Changed list command now sorts projects alphabetically
- Changed list command embed now shows total projects tracked out of guild maximum

- Removed `/mode` command (replaced by `/settings` command)

- Fixed incorrect embed color on "more results" embed for Modrinth searches

## \[1.1.7] (2022-09-24)

- Changed switched to Doppler for secret management

## \[1.1.6] (2022-09-03)

- Fixed triple-posting updates for CurseForge projects

## \[1.1.5] (2022-08-26)

- Fixed notification mode setting being ignored
- Fixed release type in Modrinth compact notification embeds not being capitalized

## \[1.1.4] (2022-08-24)

- Fixed update check logic with CurseForge projects
- Fixed missing settings for guilds not in database on update check

## \[1.1.3] (2022-08-22)

- Added validation to Modrinth project IDs on track request to prevent breaking the database

## \[1.1.2] (2022-08-22)

- Fixed updates displaying for CurseForge files still in `Processing` or status other than `Approved`
- Fixed updates displaying for CurseForge files upon additional file upload
- Fixed release type displaying as uncapitalized in Modrinth update embeds

## \[1.1.1] (2022-08-11)

- Fixed when compact mode is enabled, notifications show both compact and normal embed
- Fixed presence data not showing

## \[1.1.0] (2022-08-09)

- Added ApiCallManager for basic API call volume monitoring
- Added Changelog file to more accurately document changes
- Added new getMods and getProjects endpoint methods
- Changed database schema to support various new features

- Reduced project update check cycle from ten minutes to one minute
- Rewrote API endpoint methods for consistancy and support for ApiCallManager
- Rewrote trackProject function to support new database schema
- Rewrote untrackProject function to support new database schema
- Rewrote project update check cycle to support new database schema and make use of batch calls
- Rewrote the list command to utilize embeds and support multiple channels
- Switched to default permssions from strict enforcement of Manage Channels permssion
- Updated to discord.js v14

- Fixed CurseForge project types other than Mod or Modpack displaying on search result embeds as 'Other'
- Fixed CurseForge links for update embeds not working correctly for project types other than Mod or Modpack
- Fixed CurseForge update embeds only displaying latest Release file when the new file was a Beta or Alpha release
- Fixed update embed date updated field displaying unlocalized timestamps
- Fixed presence data counting the same project multiple times
