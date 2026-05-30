function isDisabled(currentIndex, itemId, selectedItems, validSpecs) {
  let disabled = false;
  let pattern = '';

  for (let index = 0; index < selectedItems.length; index += 1) {
    if (index !== currentIndex) {
      pattern += selectedItems[index] != null ? `${selectedItems[index]}_` : '[0-9]*_';
    } else {
      pattern += `${itemId}_`;
    }
  }

  pattern = pattern.substr(0, pattern.length - 1);
  const matcher = new RegExp(pattern, 'g');

  for (let index = 0; index < validSpecs.length; index += 1) {
    const specKey = validSpecs[index].join('_');
    disabled = matcher.test(specKey);
    if (disabled) break;
  }

  return !disabled;
}

export function judgeSelect(specs, currentIndex, selectedItems, validSpecs) {
  for (let specIndex = 0; specIndex < specs.length; specIndex += 1) {
    const spec = specs[specIndex];
    for (let itemIndex = 0; itemIndex < spec.spec_items.length; itemIndex += 1) {
      const item = spec.spec_items[itemIndex];
      if (specIndex !== currentIndex) {
        item.disabled = isDisabled(specIndex, item.item_id, selectedItems, validSpecs);
      }
    }
  }
}

export default judgeSelect;
