# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0-pr1] - 2022-11-02

### Added

- `/settings` command to replace `/mode` command
- New `projectid` and `channel` parameters to `/untrack` for more control over project tracking
- New `channel` parameter to `/list` for filtering tracked projects by channel
- Limit on the number of tracked projects allowed for a single guild

### Changed

- Rewrote internal database structure
- List command now sorts projects alphabetically
- List command embed now shows total projects tracked out of guild maximum

### Removed

- `/mode` command (replaced by `/settings` command)

### Fixed

- Incorrect embed color on "more results" embed for Modrinth searches

## [1.1.7] - 2022-09-24

### Changed
- Switched to Doppler for secret management

## [1.1.6] - 2022-09-03

### Fixed

- Triple-posting updates for CurseForge projects

## [1.1.5] - 2022-08-26

### Fixed

- Notification mode setting being ignored
- Release type in Modrinth compact notification embeds not being capitalized

## [1.1.4] - 2022-08-24

### Fixed

- Update check logic with CurseForge projects
- Missing settings for guilds not in database on update check

## [1.1.3] - 2022-08-22

### Added

- Validation to Modrinth project IDs on track request to prevent breaking the database

## [1.1.2] - 2022-08-22

### Fixed

- Updates displaying for CurseForge files still in `Processing` or status other than `Approved`
- Updates displaying for CurseForge files upon additional file upload
- Release type displaying as uncapitalized in Modrinth update embeds

## [1.1.1] - 2022-08-11

### Fixed

- When compact mode is enabled, notifications show both compact and normal embed
- Presence data not showing

## [1.1.0] - 2022-08-09

### Added

- ApiCallManager for basic API call volume monitoring
- Changelog file to more accurately document changes

### Changed

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

### Fixed

- CurseForge project types other than Mod or Modpack displaying on search result embeds as 'Other'
- CurseForge links for update embeds not working correctly for project types other than Mod or Modpack
- CurseForge update embeds only displaying latest Release file when the new file was a Beta or Alpha release
- Update embed date updated field displaying unlocalized timestamps
- Presence data counting the same project multiple times
