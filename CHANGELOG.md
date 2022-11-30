# Changelog

## \[1.2.6] (2022-11-28)

- Fixed Notifications being sent for previous project updates

## [1.2.5] (2022-11-28)

- Fixed capitalization bug on CurseForge project update notifications

## [1.2.4] (2022-11-27)

- Fixed missing notifications for updated CurseForge projects

## [1.2.3] (2022-11-19)

- Added checks for tracked projects in deleted channels in `list` command and update check cycle
- Added sweepers for stale database data

## [1.2.2] (20220-11-15)

- Added some minor error handling for more graceful handling of failed API calls

## [1.2.1] (2022-11-14)

- Fixed posting notifications for old updates for CurseForge projects

## [1.2.0] (2022-11-14)

- Added `/settings` command to replace `/mode` command
- Added new `projectid` and `channel` parameters to `/untrack` for more control over project tracking
- Added new `channel` parameter to `/list` for filtering tracked projects by channel
- Added limit on the number of tracked projects allowed for a single guild

- Changed internal database structure
- Changed list command now sorts projects alphabetically
- Changed list command embed now shows total projects tracked out of guild maximum

- Removed `/mode` command (replaced by `/settings` command)

- Fixed incorrect embed color on "more results" embed for Modrinth searches

## [1.1.7] (2022-09-24)

- Changed switched to Doppler for secret management

## [1.1.6] (2022-09-03)

- Fixed triple-posting updates for CurseForge projects

## [1.1.5] (2022-08-26)

- Fixed notification mode setting being ignored
- Fixed release type in Modrinth compact notification embeds not being capitalized

## [1.1.4] (2022-08-24)

- Fixed update check logic with CurseForge projects
- Fixed missing settings for guilds not in database on update check

## [1.1.3] (2022-08-22)

- Added validation to Modrinth project IDs on track request to prevent breaking the database

## [1.1.2] (2022-08-22)

- Fixed updates displaying for CurseForge files still in `Processing` or status other than `Approved`
- Fixed updates displaying for CurseForge files upon additional file upload
- Fixed release type displaying as uncapitalized in Modrinth update embeds

## [1.1.1] (2022-08-11)

- Fixed when compact mode is enabled, notifications show both compact and normal embed
- Fixed presence data not showing

## [1.1.0] (2022-08-09)

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
