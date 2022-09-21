# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] -

- Support for Wagtail
- Updating Celery for new documentation domain

## [1.0.3] - 2020-01-10

### Added

- Extension popup which shows current preferred versions and an option to reset.

### Fixed

- Fixed issue #4 which choked for python version "3.10 (dev)"

## [1.0.2] - 2020-01-06

### Fixed

- Fixed issue #3 which stored preferred version "Current" from PostgreSQL links but needed "current" for the URL.

## [1.0.1] - 2020-01-06

### Added

- Support for Celery

### Fixed

- Changed icons from svg to png format. Chrome extensions don't support svg icons and nothing in the testing or publishing process complained about this, but the end result meant that the published Chrome extension couldn't be installed.  

## [1.0.0] - 2020-01-05

### Added

- Initial release
- Support for Django, PostgreSQL, and Python

[unreleased]: https://github.com/dougharris/unified_docs_switcher/compare/1.0.3...main
[1.0.3]: https://github.com/dougharris/unified_docs_switcher/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/dougharris/unified_docs_switcher/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/dougharris/unified_docs_switcher/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/dougharris/unified_docs_switcher/releases/tag/1.0.0
