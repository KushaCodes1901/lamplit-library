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
