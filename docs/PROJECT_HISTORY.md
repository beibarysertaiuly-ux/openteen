# Project history

## Original upload

The public repository's initial commit is `87a7f69a3835a79ece43d80e86282ee57978e024`, dated 5 January 2026 in its Git metadata. A single upload is not a complete development timeline and does not independently establish when every feature was built or who wrote each section.

The uploaded code includes React screens for onboarding, discovering profiles, requests, chat, profile editing, and settings. It contains interest-based sorting, a small word-translation dictionary, rule-based filtering, and grammar-provider integration code. Its accounts and messages use browser-local state. The initial README's broad real-time messaging and AI moderation language exceeded what the implementation established.

Beibarys reports that he and a friend built the prototype with AI coding assistance, with his work focused on design and AI features and his friend's work focused on matching and other mechanics. This is a contributor account, not an inference from the repository's commit history. Competition participation and outcomes require separate records; this repository does not verify them.

## Maintenance — 30 October 2026

This pass was completed with Codex assistance to make the existing idea easier to run, inspect, and explain:

- Added an explicitly fictional demo with role switching, sample conversation, and reset.
- Reworked local state so requests require recipient acceptance, connections work for both participants, messages retain sender identity, reactions persist, and settings stay with the active account.
- Fixed self-discovery, stale discovery results, profile-request imports, profile synchronization, and notification visibility.
- Replaced the browser-side AI helper with a loopback-only Node endpoint; removed unused provider code and prompt/key logging. Added limits, validation, timeouts, and explicit failure states.
- Clarified word lookup, local reporting, deterministic filtering, and the distinction between prototype and live service.
- Removed misleading mock two-factor verification, precise-location requests, and placeholder files; added a favicon and automated checks.
- Added local voice-note data storage and a recording cap; the voice UI remains experimental and untested on hardware.
- Updated dependencies and rewrote setup, walkthrough, limitations, and verification documentation.

These are later repairs and additions. Their existence does not verify an earlier competition demonstration or extend either original contributor's historical claims. Original history remains intact.
