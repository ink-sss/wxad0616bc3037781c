# fix uniapp home duplicate products

## Goal

Fix the uni-app home page so the product grid does not render duplicate product cards.

## What I already know

- The reported issue is on `uniapp-src` home page.
- The screenshot shows a two-column home product grid where each row repeats the same product in both columns.
- The source scope is `uniapp-src/src/`, not the legacy root Mini Program output.

## Assumptions

- The backend/product API may return one product stream, and the frontend should render each product only once.
- The fix should preserve existing home DIY data loading, fallback data, and pagination behavior.

## Requirements

- Home page product cards must be unique by stable product identity.
- Empty/default product stream fallback must remain available when the configured home data has no product module.
- The change must stay within the uni-app source tree.

## Acceptance Criteria

- [ ] Repeated product cards are removed from the home page product grid.
- [ ] The home page still renders products when the backend returns normal data.
- [ ] Pull-down refresh and reach-bottom loading do not re-add already rendered products.
- [ ] `npm run build:mp-weixin` passes or any verification limitation is documented.

## Out of Scope

- Redesigning the home page.
- Changing backend API contracts.
- Editing legacy root Mini Program source or `uniapp-src/dist/`.

## Technical Notes

- Main entry inspected: `uniapp-src/src/pages/index/index.vue`.
- Product normalization inspected: `uniapp-src/src/services/miniprogram-products.js`.
- CodeGraph is not initialized in this checkout, so structural lookup fell back to source inspection.
