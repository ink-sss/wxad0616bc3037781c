export const addUnit = (value = "auto", unit = "px") => {
  value = String(value);
  return value ? `${value}${unit}` : value;
};

export function getCustomNavBarHeight() {
  try {
    const info = typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function"
      ? uni.getSystemInfoSync() || {}
      : {};
    const statusBarHeight = Number(info.statusBarHeight || 0);
    const model = String(info.model || "");
    const navContentHeight = model.includes("iPhone") ? 44 : 48;
    return statusBarHeight + navContentHeight;
  } catch (error) {
    console.log(error, "error");
    return 0;
  }
}

export function getCustomNavBarHeightStyle() {
  return addUnit(getCustomNavBarHeight());
}
