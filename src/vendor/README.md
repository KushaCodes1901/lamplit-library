# StPageFlip renderer

`page-flip.js` is the ESM distribution of StPageFlip 2.0.7, from the npm `page-flip@2.0.7` package and https://github.com/Nodlik/StPageFlip. The MIT license is preserved in `page-flip.LICENSE`. The local declaration describes only the public API used here. Its bundled CSS is included in the distribution. The vendor bundle is excluded from ESLint; application integration code is linted normally.

Two small lifecycle changes are applied to the upstream ESM bundle:

- The render loop checks `this.app.getUI().getDistElement().isConnected` before rendering and scheduling its next frame. Upstream `destroy()` does not cancel that loop. This prevents a discarded one-turn renderer from scheduling frames forever.
- Both delayed `init` callbacks check `this.block.isConnected` before updating the UI. This prevents initialization of a disposed renderer during React Strict Mode cleanup.

No geometry or fold calculations are modified. The application uses disposable cloned HTML pages inside an imperative DOM island. Mouse handlers are enabled on the engine so upstream `destroy()` removes all its event handlers, including `resize`; the entire visual overlay has pointer events disabled. The normal semantic text remains selectable beneath it and reduced motion bypasses the engine.

Visual reference: the introductory demonstration in https://www.youtube.com/watch?v=HFnzWoGe0so (HankTheTank). Its tutorial code, images, video and audio are not copied into this project. The reference informs the corner-fold motion and page layering.
