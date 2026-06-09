# mp-weixin platform adapter

This directory owns WeChat-only behavior for the uni-app migration. Pages and
components should import these wrappers instead of calling `wx.*` directly.

## API surface

- Runtime: `isMpWeixinRuntime`, `getWeixinApi`, `hasWeixinApi`, `canIUse`,
  `promisifyApi`, `callContext`.
- Login and authorization: `login`, `checkSession`, `getSetting`, `authorize`,
  `openSetting`, `getUserProfile`, `getUserInfo`, `normalizePhoneNumberEvent`,
  `normalizeAvatarEvent`.
- Payment: `requestPayment`, `requestMerchantTransfer`,
  `canRequestMerchantTransfer`.
- Scan: `scanCode`, `scanQrCode`.
- Location and map: `ensureLocationAuthorized`, `getLocation`,
  `chooseLocation`, `openLocation`, `createMapContext`, `mapContextCall`,
  `moveToMapLocation`, `includeMapPoints`.
- WeChat navigation and components: `navigateToMiniProgram`,
  `navigateToMiniProgramLink`, `navigateBackMiniProgram`,
  `openCustomerServiceChat`, `makePhoneCall`,
  `customerServiceButtonProps`, `officialAccountComponentProps`,
  `webViewProps`, `normalizeMiniProgramLink`.
- Subscription messages: `requestSubscribeMessage`,
  `requestSubscribeDeviceMessage`.
- Share menu and app exit: `showShareMenu`, `hideShareMenu`,
  `exitMiniProgram`.
- Account and environment: `getAccountInfo`,
  `getMenuButtonBoundingClientRect`, `getLaunchOptions`, `getEnterOptions`,
  `canUse`.
- Update manager: `getUpdateManager`, `bindUpdateManager`, `applyUpdate`.
- Screen capture and recording: `setVisualEffectOnCapture`, `hideOnCapture`,
  `resetCaptureEffect`, `onUserCaptureScreen`, `offUserCaptureScreen`,
  `getScreenRecordingState`, `onScreenRecordingStateChanged`,
  `offScreenRecordingStateChanged`.
- Live and TRTC contexts: `createLivePlayerContext`, `createLivePusherContext`,
  `liveContextCall`, `playLive`, `stopLive`, `pauseLive`, `resumeLive`,
  `requestLiveFullScreen`, `exitLiveFullScreen`, `startPush`, `stopPush`,
  `pausePush`, `resumePush`, `switchCamera`, `callTrtc`.
- IM helper: `createImHelper`.
- File/address helpers: `chooseAddress`, `chooseImage`, `uploadFile`,
  `readFileArrayBuffer`, `putFileToPresignedUrl`.

## Integration notes

- All wrappers guard missing `wx` or `uni` APIs at runtime and reject with
  `WEIXIN_API_UNSUPPORTED` where a Promise API cannot be called.
- `createImHelper` accepts `TencentCloudChat` and `TIMUploadPlugin` by
  injection so this platform layer does not force dependency loading in pages.
- Presigned image uploads avoid browser `fetch`, `XMLHttpRequest`, and Blob APIs.
  The preferred mini-program path reads the file as `ArrayBuffer` and uses
  `uni.request` with `PUT`; `uni.uploadFile` is retained as a platform-native
  fallback for environments where raw file reads are unavailable.
- `normalizePhoneNumberEvent` validates the `getPhoneNumber` event before
  backend exchange. The backend still owns decrypted phone binding.
- `customerServiceButtonProps`, `officialAccountComponentProps`, and
  `webViewProps` return component props only; page templates still own the
  actual `button open-type="contact"`, `official-account`, and `web-view`
  markup.

## Device acceptance still required

- WeChat login, session expiry, and phone binding on a real device.
- Payment and merchant transfer, including unsupported-version fallback.
- Scan-code write-off links and mini-program link parsing.
- Location authorization denial/retry and map context operations.
- Customer service, official account, web-view message bridge, and
  `navigateToMiniProgram` with production app IDs.
- Live player/pusher fullscreen, TRTC interaction, and IM AVChatRoom
  join/quit/message lifecycle.
- Subscribe-message prompts and update-manager flow.
- Screenshot hiding and screen-recording callbacks.
