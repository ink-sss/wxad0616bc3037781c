# Page Inventory

Read-only exploration found the current repository is compiled mp-weixin output, not original uni-app source.

* `app.json` configures 171 routes.
* Main package: 48 pages, all with real route entries.
* Subpackages: 9 roots and 123 pages.
* `pagesPlus/` has 27 routes, all placeholder-only in current output.
* About 55 routes contain recoverable business content.
* About 115 routes are compiled placeholder shells (`Page({ data: {} })`, simple text WXML, component JSON).
* One configured route points to `components/upload/upload` rather than `pages/**`.

Implementation implication: create compile-safe placeholder `.vue` pages for routes with no recoverable business logic, and do not claim feature parity for those routes without a later product reimplementation task.
