# Changelog

## 0.4.1

- Added utils module for kras injectors, use `kras/utils`
- Fixed picking wrong paths in local injector debug mode
- Improved injector file options in the API and client
- Improved injector directory options in the API and client
- Allow switching `delay` in the client for the har-injector
- Added `randomize` option for the json-injector

## 0.4.0

- Changed default base directory from `db` to `mocks`
- By default all injectors also use the base directory
- Fixed bug where files have been present, but not evaluated
- Also allow variations of injector names
- Enable local debugging of injectors
- Added information on creating injectors

## 0.3.2

- Added restart and stop functionality
- Introduced dedicated logs page
- Documentation on usage with webpack
- Non-existing directory is created and watched

## 0.3.1

- Edit directories during runtime in the client
- Extended injector resolution algorithm
- Allow transmitting WebSocket send

## 0.3.0

- Included log levels, `error`, `debug`, and `info`
- Introduced more log messages (if wanted)
- Go back: store current tab in route
- Provide ability to edit files in the client
- Added support for multi directories in the HAR, JSON, and Script injector

## 0.2.1

- Script injector now ignores modules that do not export a function
- Fixed the badge links in README
- Fixed the double execution of build
- Expose `readKrasConfig` and default `krasrc` name
- Show available logs in the overview of the management client
- Allow resetting logs via the management API

## 0.2.0

- Implemented the deactivate WS setting
- Improved error handling in the client
- Started injector documentation
- Introduced general information in the client
- Advanced settings for the proxy request

## 0.1.4

- Removed unused dependency to http-proxy

## 0.1.3

- Enhanced config construction
- Configuration reduced to JSON only
- Extended the README

## 0.1.2

- Improved file path handling
- Connect manage app to live feed
- Extended options of injectors

## 0.1.1

- Improved release automation
- Fixed binary creation
- Deliver typings in package
- Optimized package content

## 0.1.0

- Initial release
