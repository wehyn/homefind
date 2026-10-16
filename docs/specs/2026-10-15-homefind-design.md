# HomeFind product and design spec

**Status:** Approved
**Updated:** 2026-10-16

## Goal

Help one family remember where household belongings are stored. A member can photograph and name an item, assign it to a place in the home, then find it with a name search and see its photo and location.

## Product decisions

- Build an installable, mobile-first web app (PWA) with Next.js.
- Self-host one Node.js app instance and keep SQLite plus private item photos on durable local storage on that server.
- Support one household. Every household member can view, add, edit, move, and delete items. Only the owner can create invitations.
- An item requires a name, one photo, and one location. Notes are optional.
- A location can be assigned at any depth in the tree, including a room, shelf, or container.
- Search is the home screen. It updates as the person types and matches partial, case-insensitive item names.
- Use soft off-white surfaces, dark charcoal text, and a restrained terracotta accent. Keep strong contrast, clear type, and restrained decoration; leave item photos in their natural colors.
- The app is online-first. Remote access uses HTTPS.

## Main flows

### Search

The initial screen has a prominent name search, a small list of recent items, and a labeled **Add item** button. Search results and recent-item rows show the item photo, name, and full location path. They do not show who added the item. Search has clear empty-inventory and no-match states. Search is limited to item names in v1.

### Add an item

The Add screen is one compact form with the photo, name, location, and Save action. The photo is required; its control offers both **Camera** and **Photo Library**. Name and location are required. Optional notes are hidden behind **Add note**.

The location field opens an expandable location tree. Tapping a location row selects that location; a separate chevron expands or collapses its children. Any location level can be selected. A missing location can be created inside the picker, one level at a time under the current parent. The new location is selected immediately so the member can continue adding the item or create its child location.

The server validates the submitted fields and photo. The app reports success only after both the photo and item record are saved. A failure is retryable and must not leave an incomplete item visible in search.

### Item details, editing, moving, and deleting

The detail screen shows the photo, item name, full location path, and optional notes. **Move** is a separate, direct action from editing. Members can edit the name and notes. Members can delete an item after confirming; deletion removes it from search and removes its stored photo.

### Join the household

The first account creates the household and becomes its owner. The owner creates a single-use invitation link that expires after seven days and shares it with relatives. Each member uses an individual account. A signed-in account without household membership cannot see household data.

## Data, access, and privacy

Store household membership, hierarchical locations, item names, optional notes, photo paths, and timestamps in SQLite. Store photo files in a private upload directory on the same durable disk; SQLite stores only server-generated relative paths.

The browser never connects to SQLite or the private upload directory. Every item, location, invitation, and photo request goes through the Next.js server, requires a valid account, and checks household membership. Photo responses are private and non-cacheable. Validate uploaded image content and size, generate safe filenames, and never accept a client-supplied storage path.

Use a maintained authentication library rather than implementing password storage or session handling from scratch. V1 does not configure email delivery or provide self-service password resets; a forgotten password cannot be reset through the app. SMTP-backed recovery can be added later.

## Hosting and data protection

Run one Next.js server instance, directly or in Docker, behind an HTTPS reverse proxy. Mount durable local storage for both the SQLite database and private photos. Do not put SQLite on a network filesystem or run multiple app instances against separate database files.

Back up the database and photo directory together, and verify that a backup can restore both. Private household data is not cached by a service worker. Offline search and offline item entry are out of scope.

## Visual and interaction direction

Use soft off-white surfaces, dark charcoal text, and a restrained terracotta accent. Keep a clear type hierarchy, useful whitespace, simple item rows, and only the controls needed for search and capture. Use the accent sparingly for primary actions and location cues, and keep item photos in their natural colors. Keep photos and full location paths easy to scan. Keep the interface usable on narrow phone screens, by keyboard, and with a screen reader. The location row and expand control must be separate, understandable actions.

## Out of scope for v1

- Multiple households or properties
- GPS-based indoor locations
- AI image recognition or OCR
- Barcode scanning
- Offline synchronization
- Categories, tags, reminders, or analytics
- Search by notes or location

## Acceptance checks

- A member can add a required photo, name, and location in one compact form; Camera and Photo Library are both available.
- A member can assign an item to any existing location level or create the next location level inline; the new location is selected.
- Partial, mixed-case item-name searches update as the person types and return the expected items.
- Recent items and search results show a photo, name, and full location path without the added-by field.
- Empty inventory and no-match states explain what to do next.
- A member can edit an item's name or notes, move it with a separate action, and delete it after confirmation.
- A second invited account can view and edit the same household inventory; an account outside the household cannot access items or private photos.
- Failed uploads and saves show a retryable error and do not create an incomplete item.
- Data and photos remain available after a server restart, and a tested backup can restore both.
- The PWA can be installed and its camera/photo-library flow works on current iOS Safari and Android Chrome over HTTPS.
