# Verification record — 30 October 2026

## Automated checks

Environment: Windows, Node.js 24.12.0. Commands run from the repository root.

| Check | Result | What it establishes |
| --- | --- | --- |
| `npm test` | Passed | Local account transitions, recipient-only acceptance, duplicate prevention, two-sided messages and reactions, blocking, preferences, profile updates, persisted state, deterministic rules; grammar response handling and errors with a mocked provider |
| `npm run build` | Passed | The frontend transforms and bundles for production |
| `npm audit` | Zero known vulnerabilities at the time checked | Registry audit of the installed dependency set; not a security certification |
| Local development HTTP response | HTTP 200 | The development entry page is served |

The grammar endpoint tests run against a temporary local HTTP server. They cover missing credentials, valid mocked corrections, invalid input, unrelated origins, unsupported methods, malformed provider output, and provider errors. They do not contact Google or establish model quality.

## Verification limits

The browser-control tool stopped before a visual walkthrough could be completed. No screenshot, mobile-layout pass, accessibility audit, or end-to-end browser-test pass is claimed. A real Gemini key was not supplied, so live suggestions, model availability, account quota, and provider billing were not tested. Microphone recording and image upload were not hardware tested. No separate-device delivery exists.

The automated tests verify application logic and the build verifies compilation. Neither guarantees every rendered interaction. Complete the following checklist before presenting a live walkthrough.

## Manual walkthrough checklist

- [ ] Install with `npm ci`; run `npm run dev`; open the printed loopback URL.
- [ ] Explore the demo; confirm the prototype banner, fictional profiles, and ranking explanation are readable.
- [ ] Inspect discovery, requests, chat, profiles, and settings on a narrow and a wide screen.
- [ ] As Alex, request Jamie; switch to Jamie and accept via the notification or Requests tab.
- [ ] Send messages in both roles; return to the chat list and choose each connected profile.
- [ ] React to a message and refresh; verify message and reaction persistence.
- [ ] Block Sam; switch to Sam and verify Alex is unavailable; unblock from Alex's settings.
- [ ] Change a profile name/photo; verify discovery and connected profiles remain consistent.
- [ ] Confirm word lookup identifies itself as a limited Spanish dictionary.
- [ ] Without a grammar key, enable assistance and verify an unavailable message with a send-original option.
- [ ] If testing live AI, configure your own key, start `npm run server`, and use non-sensitive example drafts. Verify correction review and provider failure behavior.
- [ ] If testing voice notes, grant microphone permission yourself; record, stop, replay, refresh, and check storage limits. Recordings should stop by approximately one minute.
- [ ] Test theme switching, demo reset, local test sign-up/onboarding/login, and empty discovery/request states.

## Storage and service boundaries

Data uses `openteen-prototype-v2` in localStorage, leaving the initial prototype's old storage key untouched. The browser-local workspace is shared by its demo roles and test accounts. It is not an isolation or authentication boundary; anyone with access to that browser can inspect its records, including disposable test passwords. Browser storage has finite capacity and clearing site data removes records.

Reports and filtering are demonstrations. There is no reviewer, external report delivery, or guarantee that harmful messages will be detected. Public operation would require a separate security and safeguarding design.
