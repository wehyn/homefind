# HomeFind design

**Status:** Draft for user review
**Date:** 2026-10-15

## Goal

Help one family keep a shared record of household items so anyone can search by item name and see a photo and the item's exact storage location.

## Product decisions

- Build an installable, mobile-first web app (PWA) with Next.js.
- Run it on one self-hosted Node.js server and use SQLite on that server's persistent local disk.
- Keep the first screen **Search first**: a prominent name search, recent items with photos and location paths, and a clear **Add an item** action.
- Support one household. Invited members can view, add, edit, and move its items.
- Each item has a required name, one required photo, one saved location, and optional notes.
- Locations form a tree such as `Garage → Shelf 2 → Blue bin`.
- The app is online-first. Family members can access it away from home through HTTPS.

## Main flows

### Add an item

1. A member taps **Add an item**.
2. They take a photo or choose one from the phone's library.
3. They enter the item name and select an existing location or create a location path.
4. On successful save, the item appears in search results with its photo and full location.

### Find or move an item

1. A member types all or part of the item name in the search field.
2. Results show a thumbnail, item name, location path, and who added it.
3. A member can edit the name or move the item to another saved location.

Search ignores letter case and matches partial item names. An empty inventory and a search with no matches receive clear, useful messages.

### Join the household

The first account creates the household and becomes its owner. The owner can create a single-use invitation link that expires after seven days and share it with relatives. Each member has an individual account. Members can manage items; only the owner can manage invitations.

## Data and access

Store household membership, hierarchical locations, item names, optional notes, photo paths, and created/updated timestamps in SQLite. Keep photo files in a private upload directory on the same persistent disk; store only their server-generated relative paths in SQLite.

The browser never connects to SQLite directly. Every item, location, invitation, and photo request goes through the Next.js server, which requires a valid account and checks household membership. Photo URLs must not expose the private upload directory. Validate uploaded image content and size, generate safe filenames, and return a retryable error when an upload or save fails. Do not report success or leave a partial item when its photo could not be saved.

Use a maintained authentication library rather than implementing password storage or session handling from scratch. The specific library and sign-in method will be selected in the implementation plan after checking current Next.js and SQLite support.

## Hosting and data protection

Run one Next.js server instance, directly or in Docker, behind an HTTPS reverse proxy. Mount a durable host directory for both the SQLite database and private photos. Do not put the database on a network filesystem or run multiple app instances against independent SQLite files.

Back up the database and photo directory together. Verify that a backup can be restored before calling the app ready for family use. The app requires an internet connection; offline data entry and offline search are out of scope.

## Visual direction

Use the selected **Search first** direction from the prototype: warm, calm surfaces; readable item rows; a prominent search field; clear photo and location hierarchy; and one obvious add action. Keep the main flow usable on narrow phone screens and by keyboard and screen reader.

## Out of scope for v1

- Multiple households or properties
- GPS-based indoor locations
- AI photo recognition or OCR
- Barcode scanning
- Offline synchronization
- Categories, tags, reminders, or analytics

## Acceptance checks

- A member can add a photo, name, and nested location; the item appears in search with its full path.
- Partial and mixed-case name searches find the expected item; no-match and empty states are clear.
- A member can update an item and move it to another location.
- A second invited account can view and edit the same household inventory; an account outside the household cannot access its data or photos.
- Failed uploads and failed saves show a retryable error and do not create an incomplete item.
- Data and photos remain available after a server restart, and a tested backup can restore both.
- The PWA can be installed and its camera/photo-picker flow works on current iOS Safari and Android Chrome over HTTPS.
