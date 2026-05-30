# Component Inventory

Component inventory:

* `components/`: 54 component declarations.
* `uni_modules/`: 4 modules (`uni-icons`, `uni-notice-bar`, `uni-popup`, `uni-transition`).
* `components/upload/upload2.js` is an extra implementation file.

Recommended strategy:

* Replace clear legacy uni components with official `uni_modules` equivalents where possible.
* Preserve business components such as `app-share`, `mp-share`, `header`, `tabbar`, `liveTab`, `recommendProduct`, `upload`, and DIY modules.
* Preserve Options API for recovered custom components.
* Convert WXML directives and bindings to Vue/uni syntax.
* Clean compiled selectors such as `wx-image`, `wx-button`, `wx-view`, and scoped `data-v-*` artifacts.

High-priority component checks:

* DIY dynamic type coverage.
* Event contracts such as `close`, `returnVal`, `setIndex`, `parentFunc`, `scanQrcode`, `onConfirm`, `onCancel`, `onChange`.
* Countdown timer cleanup.
* Upload, picker, popup, swiper, tabbar, and scroll measurement behavior.
