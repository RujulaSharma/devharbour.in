# Website & Profiles workstream
Read README.md first.

## Source files
- public/index.html — canonical site; root index.html is generated
- public/assets/profile-ecosystem.js and .css — profile/settings renderer
- scripts/build.js and scripts/build_standalone.js — regenerate synchronized outputs
- public/assets/profile-page.* — legacy profile assets; avoid reintroducing conflicting renderers

## Routes
/profile: owner profile; /u/:username: privacy-controlled public profile.
/theme: appearance only; /settings: account settings.
/profile/setting and /profile/setting/privacy: profile settings and privacy.
Legacy aliases may exist; preserve working links while normalizing navigation.

## Rules
Use white/lavender reference, real data and accessible responsive controls. Owner and visitor share one renderer. No profile editing controls for visitors. Theme highlights only on /theme. Settings link stays at bottom of sidebar. Profile assets are bundled atomically by build.js. Coordinate shared certificate rendering with Certificates.

## Known regression
Sidebar initialization previously crashed because Settings is an anchor, not a button. Regression test: tests/sidebar_startup.test.js. Avoid assumptions that every sidebar entry is a button.
