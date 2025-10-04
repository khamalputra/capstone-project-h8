const React = require('react');
const ReactDOM = require('react-dom');

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

function composeEventHandlers(first, second) {
  return (event, ...args) => {
    if (typeof first === 'function') {
      first(event, ...args);
    }
    if (!event.defaultPrevented && typeof second === 'function') {
      second(event, ...args);
    }
  };
}

const DialogContext = React.createContext(null);

function useDialogContext(component) {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used within <Dialog.Root>`);
  }
  return context;
}

const Root = ({ children, open: openProp, defaultOpen = false, onOpenChange, modal = true }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      if (onOpenChange) {
        onOpenChange(next);
      }
    },
    [isControlled, onOpenChange, open]
  );

  const context = React.useMemo(
    () => ({
      open,
      setOpen,
      modal
    }),
    [open, setOpen, modal]
  );

  return React.createElement(DialogContext.Provider, { value: context }, children);
};
Root.displayName = 'DialogRoot';

const Trigger = React.forwardRef(function DialogTrigger({ asChild = false, children, ...props }, forwardedRef) {
  const { setOpen } = useDialogContext('DialogTrigger');
  const triggerProps = {
    ...props,
    onClick: composeEventHandlers(props.onClick, () => setOpen(true))
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = {
      ...children.props,
      ...triggerProps,
      onClick: composeEventHandlers(children.props.onClick, triggerProps.onClick)
    };
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...childProps, ref: mergedRef });
  }

  return React.createElement('button', { type: 'button', ...triggerProps, ref: forwardedRef }, children);
});
Trigger.displayName = 'DialogTrigger';

const Close = React.forwardRef(function DialogClose({ asChild = false, children, ...props }, forwardedRef) {
  const { setOpen } = useDialogContext('DialogClose');
  const closeProps = {
    ...props,
    onClick: composeEventHandlers(props.onClick, () => setOpen(false))
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = {
      ...children.props,
      ...closeProps,
      onClick: composeEventHandlers(children.props.onClick, closeProps.onClick)
    };
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...childProps, ref: mergedRef });
  }

  return React.createElement('button', { type: 'button', ...closeProps, ref: forwardedRef }, children);
});
Close.displayName = 'DialogClose';

const Portal = ({ children, container }) => {
  const { open } = useDialogContext('DialogPortal');
  const [mountNode, setMountNode] = React.useState(null);

  React.useEffect(() => {
    const target = container ?? (typeof document !== 'undefined' ? document.body : null);
    setMountNode(target);
  }, [container]);

  if (!open || !mountNode) {
    return null;
  }

  return ReactDOM.createPortal(children, mountNode);
};
Portal.displayName = 'DialogPortal';

const Overlay = React.forwardRef(function DialogOverlay({ asChild = false, children, ...props }, forwardedRef) {
  const { open } = useDialogContext('DialogOverlay');
  if (!open) {
    return null;
  }

  if (asChild && React.isValidElement(children)) {
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...props, ref: mergedRef });
  }

  return React.createElement('div', { ...props, ref: forwardedRef }, children);
});
Overlay.displayName = 'DialogOverlay';

const Content = React.forwardRef(function DialogContent({ asChild = false, children, onEscapeKeyDown, onPointerDownOutside, ...props }, forwardedRef) {
  const { open, setOpen } = useDialogContext('DialogContent');

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (typeof onEscapeKeyDown === 'function') {
          onEscapeKeyDown(event);
        }
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onEscapeKeyDown, setOpen]);

  if (!open) {
    return null;
  }

  const handlePointerDown = (event) => {
    if (typeof onPointerDownOutside === 'function') {
      onPointerDownOutside(event);
    }
    if (!event.defaultPrevented && event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    const childProps = {
      ...children.props,
      ...props,
      ref: mergedRef,
      onPointerDown: composeEventHandlers(children.props.onPointerDown, handlePointerDown)
    };
    return React.cloneElement(children, childProps);
  }

  return React.createElement(
    'div',
    {
      role: 'dialog',
      'aria-modal': true,
      ...props,
      ref: forwardedRef,
      onPointerDown: composeEventHandlers(props.onPointerDown, handlePointerDown)
    },
    children
  );
});
Content.displayName = 'DialogContent';

const Title = React.forwardRef(function DialogTitle({ asChild = false, children, ...props }, forwardedRef) {
  if (asChild && React.isValidElement(children)) {
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...props, ref: mergedRef });
  }

  return React.createElement('h2', { ...props, ref: forwardedRef }, children);
});
Title.displayName = 'DialogTitle';

const Description = React.forwardRef(function DialogDescription({ asChild = false, children, ...props }, forwardedRef) {
  if (asChild && React.isValidElement(children)) {
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...props, ref: mergedRef });
  }

  return React.createElement('p', { ...props, ref: forwardedRef }, children);
});
Description.displayName = 'DialogDescription';

module.exports = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close
};
