const React = require('react');

function assignRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object') {
    ref.current = value;
  }
}

function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (ref != null) {
        assignRef(ref, node);
      }
    }
  };
}

function composeEventHandlers(slotHandler, childHandler) {
  return function handleEvent(event, ...args) {
    if (typeof childHandler === 'function') {
      childHandler(event, ...args);
    }
    if (!event.defaultPrevented && typeof slotHandler === 'function') {
      slotHandler(event, ...args);
    }
  };
}

function mergeProps(childProps = {}, slotProps = {}) {
  const result = { ...childProps };

  for (const key of Object.keys(slotProps)) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (key === 'className') {
      result.className = [childValue, slotValue].filter(Boolean).join(' ');
    } else if (key === 'style') {
      result.style = { ...childValue, ...slotValue };
    } else if (key.startsWith('on') && typeof childValue === 'function') {
      result[key] = composeEventHandlers(slotValue, childValue);
    } else {
      result[key] = slotValue;
    }
  }

  return result;
}

const Slot = React.forwardRef(function Slot({ children, ...slotProps }, forwardedRef) {
  if (!React.isValidElement(children)) {
    return children ?? null;
  }

  const mergedProps = mergeProps(children.props, slotProps);
  const childRef = children.ref;
  mergedProps.ref = mergeRefs(childRef, forwardedRef);

  return React.cloneElement(children, mergedProps);
});
Slot.displayName = 'Slot';

const Slottable = ({ children }) => React.createElement(React.Fragment, null, children);
Slottable.displayName = 'Slottable';

module.exports = {
  Slot,
  Slottable
};
