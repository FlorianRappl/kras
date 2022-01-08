# Changelog

## 0.13.2

- Added configurable file size limit (#50)
- Updated license year

## 0.13.1

- Added support for POST requests with query strings (#48)
- Updated dependencies

## 0.13.0

- Extracted the frontend to the `kras-management-portal` package
- Made the frontend easily exchangeable via the `.krasrc`

## 0.12.3

- Added support for `multipart/form-data` file upload
- Improved configuration file error notification
- Updated dependencies

## 0.12.2

- Improved stability of web socket connections
- Updated dependencies

## 0.12.1

- Fixed a bug preventing changes to root proxy targets in the UI

## 0.12.0

- Support generator in json-injector
- Added `injectHeaders` option to the proxy injector
- Added `xfwd` option to the proxy injector
- Updated dependencies

## 0.11.1

- Added options for proxy headers

## 0.11.0

- Updated dependencies
- Allow arrays for dictionary

## 0.10.3

- Updated dependencies
- Externalized `bufferutil`
- Externalized `utf-8-validate`

## 0.10.2

- Updated dependencies
- Improved declarations

## 0.10.1

- Updated dependencies
- Updated bundled declarations

## 0.10.0

- Provide kras in a pre-bundled state
- Provide kras declarations in a single file
- Updated dependencies
- Normalized the configuration (removed trailing slash)

## 0.9.1

- Updated dependencies

## 0.9.0

- Updated dependencies
- Improved the configuration
- Allow specifying injectors by fully qualified paths (#21)
- Improved configuration of map (#20)

## 0.8.3

- Updated dependencies due to CVE-2019-10746
- Updated dependencies due to CVE-2019-10747

## 0.8.2

- Updated dependencies due to WS-2019-0063
- Updated dependencies due to WS-2019-0064
- Updated dependencies due to WS-2018-0590

## 0.8.1

- Added `buildKrasWithCli` helper

## 0.8.0

- Improved re-usability of CLI in library
- Restructured library exports
- Updated dependencies

## 0.7.3

- Updated outdated dependencies
- Improved WebSocket messages
- Include more debug information

## 0.7.2

- Fixed bug in WebSocket initialization
- Updated outdated dependencies

## 0.7.1

- Updated outdated dependencies
- Updated dependencies due to GHSA-mh6f-8j2x-4483

## 0.7.0

- Updated dependencies due to CVE-2018-1000620
- Updated dependencies due to CVE-2018-16469
- Expose `KrasServer`
- Added linting and prettier

## 0.6.7

- Updated dependencies due to CVE 2018-14041

## 0.6.6

- Updated dependencies due to CVE 2018-3721
- Updated dependencies due to CVE 2018-3774
- Refactored deprecated calls

## 0.6.5

- Updated dependencies due to CVE 2018-3719

## 0.6.4

- Updated request to effectively use hook 4.2.1
- Removed unnecessary console.log
- Updated documentation

## 0.6.3

- Fixed find target bug in HAR injector
- Made `ScriptResponseBuilderData` properties optional
- Allow setting WebSocket options

## 0.6.2

- Cover WebSockets with any route (if no target given)
- Middleware works against base directory (in case of path)
- Command-line option to disable API (`--skip-api`)
- Expose the `KrasWebSocket`

## 0.6.1

- Fixed WebSocket communication after opening (#18)
- WebSocket injection in scripts is now possible (#16)
- Possibility for middleware via options (#15)
- Scripts from the script injector get the server via `$server` from the context
- Disabled management API disables recording

## 0.6.0

- Option for deactivating management API (#13)
- Ability to protect the management API (#14)
- Provide download settings functionality (#17)

## 0.5.0

- Enhanced documentation (#10)
- Provide function injector for unit tests
- Improved initial console output
- Added preview animation to README

## 0.4.4

- Fixed WS proxy bug when sending on closed sockets (#12)
- Added roadmap

## 0.4.3

- Allow editing extended config of script injector in client
- Provided convenience functions for unit testing (#11)
- Added ability to dispose injectors for fully stopping the server

## 0.4.2

- Include typings for `kras/utils` module
- Default to plain text editing in the client
- Also include YAML as potential format in the client

## 0.4.1

- Added utils module for kras injectors, use `kras/utils`
- Fixed picking wrong paths in local injector debug mode
- Improved injector file options in the API and client
- Improved injector directory options in the API and client (#9)
- Allow switching `delay` in the client for the har-injector
- Added `randomize` option for the json-injector

## 0.4.0

- Changed default base directory from `db` to `mocks`
- By default all injectors also use the base directory
- Fixed bug where files have been present, but not evaluated (#8)
- Also allow variations of injector names
- Enable local debugging of injectors
- Added information on creating injectors

## 0.3.2

- Added restart and stop functionality (#5)
- Introduced dedicated logs page
- Documentation on usage with webpack
- Non-existing directory is created and watched (#7)

## 0.3.1

- Edit directories during runtime in the client
- Extended injector resolution algorithm
- Allow transmitting WebSocket send (#6)

## 0.3.0

- Included log levels, `error`, `debug`, and `info`
- Introduced more log messages (if wanted)
- Go back: store current tab in route
- Provide ability to edit files in the client (#4)
- Added support for multi directories in the HAR, JSON, and Script injector (#3)

## 0.2.1

- Script injector now ignores modules that do not export a function (#2)
- Fixed the badge links in README
- Fixed the double execution of build
- Expose `readKrasConfig` and default `krasrc` name
- Show available logs in the overview of the management client (#1)
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
