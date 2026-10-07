# Artwork and content

All eight stories were written as original AI-assisted fiction for this demo. No novels were scraped, and no real author or publisher is credited. Stories contain 500–900 words each and live in `src/data/books.ts`; IDs remain stable when adding new entries. Titles, genre labels, cover typography, and interface text are HTML, not embedded artwork.

The supplied illustrated concept guided the elevated camera, warm walnut, rainy arched windows, amber lighting, rugs, and traditional furniture. Five final raster assets were generated using the built-in image-generation tool, inspected, and optimized to self-hosted WebP. The reference itself is not published. Room and furniture layers are separate; collision footprints and occlusion are implemented in code.

| Asset                        | Purpose                                                         | Size                       |
| ---------------------------- | --------------------------------------------------------------- | -------------------------- |
| `public/assets/room.webp`    | Open room with perimeter shelves, fireplace, and reading corner | 1536 × 1024                |
| `public/assets/shelf.webp`   | Shared original walnut shelf sprite                             | optimized transparent WebP |
| `public/assets/table.webp`   | Reading table, chairs, and green brass lamps                    | optimized transparent WebP |
| `public/assets/visitor.webp` | Twelve frames: four facings, idle and two walking steps         | 384 × 528                  |
| `public/assets/covers.webp`  | Eight original illustrations, four columns by two rows          | 1536 × 1024                |

Final images total approximately 1.2 MB. Optimization only trims transparent margins, resizes, aligns animation cells, and compresses generated pixels. `scripts/prepare-assets.mjs` records that pipeline; it is not needed to run or build the app.

Fonts are self-hosted through Fontsource: Cormorant Garamond, DM Sans, and Libre Baskerville, under the SIL Open Font License. Lucide icons use the ISC license. React, Vite and the surrounding libraries retain their package licenses; Phaser 3.90.0 uses the MIT license.

## Generation prompts

**Room:** Edit the supplied concept while preserving its camera, illustrated realism, arched rainy windows, fixed wall shelving, fireplace, and armchairs. Remove the four freestanding shelves, human, reading table, reception desk, foreground walls and entrance. Fill with coherent wooden floor; retain rugs. Keep the center open for separate game sprites. No people or text.

**Shelf:** One isolated transparent low walnut library bookcase, three rows of jewel-tone books, a little brass lamp, small ivy, and stacked books. Elevated angled camera, front and top visible, right side narrow; long edge descends slightly toward the right. Detailed painted amber lighting matching the reference. No room, floor, labels or text.

**Visitor:** Transparent four-column, three-row sheet of the same modest adult in cream shirt, brown trousers and shoes, and dark hair. Columns face southeast, southwest, northeast and northwest. Rows show standing, left step and right step. Consistent scale, full body, generous transparent spacing, elevated view and warm painterly lighting. No grid lines, labels or text.

**Table:** Isolated transparent walnut reading table with green brass lamps, open books, ink pot, and traditional wooden chairs. Reference camera, perspective and warm illustrated lighting. Entire feet visible. No room, rug or text.

**Covers:** Exact four-column, two-row grid of eight coherent vintage literary illustrations with gold engraving, dark jewel tones, paper grain and generous areas for HTML titles. Subjects in reading order: lamplit rainy window; ferry and orchard; pigeon on municipal chair; fine coat and ribbon; storm lighthouse; night railway parcel; moon-faced pendulum clock; blue envelope, flower and notebook. No titles, letters, publisher marks, or imitation of published editions.
