# Verification

Tested on 7 October 2026 using the Codex browser tools. This records browser viewport and pointer simulation, not physical-device certification.

## Automated checks

`npm run typecheck`, `npm run lint`, `npm test`, and the production build pass. Fourteen focused tests cover:

- Storage round trips, malformed and obsolete data, invalid bookmarks, unavailable storage, and quota failures.
- Catalog search, genre filtering, empty results, opening a book, shelf filtering, and restoring focus.
- Complete story lengths and continuous word anchors.
- Pagination without omitted or duplicate words, and stable anchors across changed page capacities.
- Projection, diagonal speed, frame independence, wall/furniture collision, and routes from the entry and every shelf to every other shelf.
- Touch cancellation, lost pointer capture, window blur, and stopping/suspending the game when panels open.

`npm audit` reports no known vulnerabilities at verification time.

## Browser checks

- All four shelves were reached in the production build by automatic obstacle-aware movement. Their panels each displayed exactly two matching stories.
- Direct clicks on the illustrated bookcase artwork were also exercised in the production preview, independently of the genre label buttons.
- WASD movement and E interaction were exercised. Escape closed the catalog and restored focus to the library. Search typing did not change the visitor's position.
- At 390 × 844, a held direction control moved the visitor, every genre shortcut reached its shelf, and the large Browse button opened the nearby shelf. Pointer cancellation is additionally covered by the component test.
- Opening a book and returning restored the exact ground position: the Mystery shelf remained at `(795, 585)`.
- All eight stories were paged from their first word to their last at the desktop viewport. DOM inspection confirmed continuous indices and no clipped paragraphs: 573, 605, 627, 645, 649, 660, 670 and 679 words respectively.
- The Blue Envelope was independently read through all eight phone pages: all 679 words appeared exactly once, without clipping.
- Reader layout was inspected at 1440 × 900, 768 × 1024, 390 × 844 and 844 × 390. Desktop shows a two-page spread; smaller screens show one page. No horizontal root overflow or clipped reader paragraphs was observed.
- A saved word anchor of 92 survived text-size changes from 17 to 24, phone/tablet/desktop reflow, theme changes, layout changes, and reload. Bookmark and Continue Reading restored it correctly.
- Chapters and the bookmark list were exercised. Light, sepia, dark, page and scrolling modes were inspected. The first-time help stayed dismissed after reload.
- The production build was served from `/lamplit-library/` and its room, sprites, covers and self-hosted fonts loaded successfully. No blocking console errors were observed.

## Publishing

The public repository is [KushaCodes1901/lamplit-library](https://github.com/KushaCodes1901/lamplit-library). The [GitHub Actions build and deployment](https://github.com/KushaCodes1901/lamplit-library/actions/runs/37683042382) both completed successfully, including all fourteen tests on the Linux runner.

The actual [public library](https://kushacodes1901.github.io/lamplit-library/) was opened and inspected after deployment. The room and cover artwork loaded, automatic navigation reached Mystery, and The Blue Envelope opened from that shelf. Page navigation and bookmarking worked; returning retained the shelf position `(795, 585)`. After a full public-page reload, Continue Reading restored word anchor `164` and the bookmark. No browser console errors were recorded. A screenshot of the public room is saved in `docs/screenshots/library-live.jpg`.

## Practical limits

No physical phone/tablet tests, screen-reader hardware audit, or measured performance guarantees are claimed. The room uses four-facing illustrated sprites with a compact two-step walk and subtle idle breathing. No ambient audio, swipe navigation, external book import or cross-device sync is included.

## Shelf and page animations — 6 November 2026 (local update)

The category catalog now has a transparent background over the room and displays titled book spines on a wooden ledge. Selecting a spine pulls a volume forward and rotates its cover toward the reader. Open Book swings the cover open before entering the reader; Put back restores the shelf. Search and genre filters remain available. Selection focus, Escape, canceled openings, and reduced motion are covered by tests.

The paginated reader has a two-sided CSS 3D turning leaf for forward and backward navigation on desktop spreads and single-page phone layouts. Animation copies are hidden from assistive technology and do not duplicate word anchors. Repeated navigation is locked during a turn, with a timeout fallback and unmount cleanup. Reduced motion skips turning leaves. Scroll mode is unchanged.

Nineteen automated tests, type checking, linting, and production build pass. The new reader tests use simulated layout measurements; they do not establish real rendered fit or animation quality.

Visual QA and publication of this update remain pending: Windows Computer Use stopped because it could not confidently determine the browser URL. No alternate UI automation was attempted. The existing public deployment is unchanged. Check the local update at http://127.0.0.1:5173/ at desktop, tablet, phone portrait and landscape sizes before publishing.

### Flexible paper refinement — 6 November 2026

Replaced the rigid rotating panel with an eighteen-strip connected paper surface. The sheet bends progressively, receives angle-dependent shading and a soft changing cast shadow, then settles smoothly in about one second. The gutter stays fixed. The stationary page keeps its outgoing text and number until it is covered, avoiding the old premature text change. Animation transforms run outside React and clean up on unmount; width changes settle to the saved anchor. Reduced motion still skips the effect.

The earlier Windows URL detection issue was avoided by selecting the ChatGPT window containing the visible localhost preview. Actual UI interaction and screenshots confirmed forward and backward turns on the desktop spread and a forward turn in the narrowed single-page preview. The preview pane was restored to its original width. This was browser layout testing, not a physical-phone test. Nineteen tests, lint and production build/type checking pass. The reader tests additionally verify that the stationary text remains in place during a spread turn and that the target anchor is visible after settling. Publication remains unchanged.

### Video-reference corner fold — 6 November 2026

Inspected the introductory demonstration in the user-supplied HankTheTank video: https://www.youtube.com/watch?v=HFnzWoGe0so. Replaced the strip-based bend with a lower-corner diagonal fold, rendered through a locally bundled MIT-licensed StPageFlip 2.0.7 engine. No tutorial assets or code are copied. Engine provenance, license and the two lifecycle fixes are recorded in `src/vendor/README.md`.

Actual localhost UI interaction and screenshot inspection exercised forward and backward desktop folds and both directions in the narrowed single-page reader. The forward single-page screenshot visibly showed the moving diagonal crease and reverse face. Resizing back to the original desktop pane preserved the reading anchor and settled onto a two-page spread. The temporary reference-video tab was paused and closed. These are browser layout checks, not physical-device tests.

Twenty-one tests pass, including two new adapter tests for forward/backward page ordering, waiting for completion, disposed initialization callbacks and engine cleanup. Lint, type checking and production build pass. The static reader text stays semantic and selectable, reading position remains anchored to word indices, and reduced motion bypasses the fold renderer. The live deployment is unchanged while the design is being refined locally.

### Book-opening reference — 6 November 2026

Inspected the six-second Fat Footage reference, https://www.youtube.com/watch?v=EiZ9phaAU7Y, using timed browser screenshots at the closed-cover, fanned-page and settled-spread stages. Recreated its cover swing and staggered page fan with original CSS 3D layers, the existing cover artwork and warm paper. The original video, textures and audio are not imported. The decorative fan leaves remain blank, matching the reference; the final title page uses the selected story's title and first section heading.

Opening lasts 2.4 seconds, with sequential leaves and a centered open spread before entering the semantic reader. Phone scaling keeps both halves inside the available width. Actual UI screenshots verified the narrow opening and reader handoff; full-view desktop inspection verified the corrected paper-over-cover layering and the two-page reader handoff. Reference tabs were closed and full-view testing was ended. These checks use browser layouts, not physical phones.

Twenty-two tests, lint, type checking and production build pass. Catalog tests verify that the reader opens only after the full sequence, reduced motion opens immediately, unmount cancels pending callbacks, and Escape cancels an opening without a delayed reader appearing. The live site remains unchanged during local design review.

### Continuous open-book reader — 6 November 2026

The reader now retains the opening's warm parchment, curved gutter, leather binding and visible page stack over the library room. Navigation and preferences sit outside the book. The page-fold surface includes the paper margins, so the entire sheet turns within the binding. Single-page responsive rules remain in place; optional light and dark paper themes are still available.

Saved data migrates in place from version 1 to version 2: existing theme preferences reset once to warm sepia, while word anchors, bookmarks, text size, reading mode and other settings remain intact. Subsequent explicit theme choices persist. A regression test verifies this migration and a later dark-theme selection.

Actual desktop UI inspection after reload confirmed the warm reader, preserved reading position, visible room and forward/backward full-paper folds. The narrower phone layout was not manually rechecked in this refinement. Twenty-three tests, lint, type checking, production build and diff whitespace checks pass. The public deployment remains unchanged; this update is available in the local preview.

### Mobile Previous fold and publication — 6 November 2026

The engine's `disableFlipByClick` corner guard also rejected programmatic portrait `flipPrev`: its simulated point lies at the visible left edge rather than the hidden two-page bounds' corner. Disabled that guard on the pointer-inert animation overlay. Navigation still runs through the reader's accessible buttons and animation lock.

Added four integration tests using the actual vendored renderer with simulated desktop/mobile dimensions. They require a moving clipped sheet during the turn and completion through the engine, before the reader fallback. Reinstating the original guard reproduced exactly one failure: mobile Previous. With the fix, both directions in both layouts pass. These geometry checks do not claim physical-device testing.

All twenty-seven tests, lint, type checking, the production build with /lamplit-library/ asset paths, and diff whitespace checks pass before publication.

Publication commit 4e717d4 passed all checks on GitHub Actions (run 42267433154). The Pages deploy step failed after remaining in deployment_queued; the existing site continued serving the previous release. A new documentation commit retries publication without changing the verified application.
