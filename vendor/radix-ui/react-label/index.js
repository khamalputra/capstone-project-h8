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

const Label = React.forwardRef(function Label({ asChild = false, children, ...props }, forwardedRef) {
  if (asChild && React.isValidElement(children)) {
    const childRef = children.ref;
    const mergedRef = mergeRefs(childRef, forwardedRef);
    return React.cloneElement(children, { ...props, ref: mergedRef });
  }

  return React.createElement('label', { ...props, ref: forwardedRef }, children);
});
Label.displayName = 'Label';

module.exports = {
  Root: Label,
  Label
};
