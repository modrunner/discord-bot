# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - YYYY-MM-DD

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