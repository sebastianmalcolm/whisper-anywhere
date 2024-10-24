# Changelog

All notable changes to the Whisper Anywhere Chrome extension will be documented in this file.

## [2.0.0] - 2024-03-25

Major update adding multi-provider support and comprehensive improvements.

### Added
- Multiple AI provider support
  - OpenAI Whisper (existing)
  - Groq integration with SDK
- Provider selection UI with capability comparison
- Real-time provider testing functionality
- Streaming support for both providers
- JSON mode support for structured output
- Provider-specific settings and optimizations
- Migration system for legacy configurations

### Changed
- Complete architecture overhaul for multi-provider support
- Enhanced error handling with provider-specific messages
- Improved configuration UI with provider comparison
- Updated documentation with provider-specific guides
- Updated extension description to reflect multi-provider support

### Technical Improvements
- Added provider abstraction layer
- Implemented provider factory pattern
- Added configuration validation system
- Enhanced error handling and recovery
- Added comprehensive testing utilities
- Improved type safety with TypeScript interfaces

### Developer Experience
- Added detailed technical documentation
- Added troubleshooting guides
- Added performance optimization guidelines
- Added migration documentation
- Added provider integration guides

### Contributors
- Development Team:
  - ordinath
  - redocrepus
  - alireza29675
  - sebastianmalcolm
- AI Development Assistance:
  - Cline
  - Claude 3.5 Sonnet

## [1.2.7] - 2024-03-01
- Various bug fixes and improvements
- Updated dependencies
- Performance optimizations

## [1.0.0] - 2024-02-15
### Initial Release
- OpenAI Whisper integration
- Basic voice-to-text functionality
- Chrome extension popup interface
- Clipboard integration

### Original Authors
- alireza29675
- redocrepus
- ordinath
