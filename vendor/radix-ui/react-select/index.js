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

const SelectContext = React.createContext(null);
const SelectItemContext = React.createContext(null);

function useSelectContext(component) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within <Select.Root>`);
  }
  return context;
}

const Root = ({
  children,
  open: openProp,
  defaultOpen = false,
  value: valueProp,
  defaultValue,
  onOpenChange,
  onValueChange,
  name
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');
  const [items, setItems] = React.useState(() => new Map());

  const isControlledOpen = openProp !== undefined;
  const isControlledValue = valueProp !== undefined;

  const open = isControlledOpen ? openProp : uncontrolledOpen;
  const value = isControlledValue ? valueProp : uncontrolledValue;

  const setOpen = React.useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(open) : next;
      if (!isControlledOpen) {
        setUncontrolledOpen(resolved);
      }
      if (onOpenChange) {
        onOpenChange(resolved);
      }
    },
    [isControlledOpen, onOpenChange, open]
  );

  const setValue = React.useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next;
      if (!isControlledValue) {
        setUncontrolledValue(resolved);
      }
      if (onValueChange) {
        onValueChange(resolved);
      }
    },
    [isControlledValue, onValueChange, value]
  );

  const registerItem = React.useCallback((itemValue) => {
    setItems((prev) => {
      if (prev.has(itemValue)) {
        return prev;
      }
      const next = new Map(prev);
      next.set(itemValue, '');
      return next;
    });
    return () => {
      setItems((prev) => {
        if (!prev.has(itemValue)) {
          return prev;
        }
        const next = new Map(prev);
        next.delete(itemValue);
        return next;
      });
    };
  }, []);

  const setItemLabel = React.useCallback((itemValue, label) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.set(itemValue, label);
      return next;
    });
  }, []);

  const context = React.useMemo(
    () => ({
      open,
      setOpen,
      value,
      setValue,
      registerItem,
      setItemLabel,
      items,
      name
    }),
    [open, setOpen, value, setValue, registerItem, setItemLabel, items, name]
  );

  return React.createElement(
    SelectContext.Provider,
    { value: context },
    children,
    name ? React.createElement('input', { type: 'hidden', name, value: value ?? '' }) : null
  );
};
Root.displayName = 'SelectRoot';

const Trigger = React.forwardRef(function SelectTrigger({ asChild = false, children, ...props }, forwardedRef) {
  const { open, setOpen } = useSelectContext('SelectTrigger');
  const triggerProps = {
    ...props,
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    onClick: composeEventHandlers(props.onClick, () => setOpen((prev) => !prev)),
    onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setOpen(true);
      }
    })
  };

  if (asChild && React.isValidElement(children)) {
    const childProps = {
      ...children.props,
      ...triggerProps,
      onClick: composeEventHandlers(children.props.onClick, triggerProps.onClick),
      onKeyDown: composeEventHandlers(children.props.onKeyDown, triggerProps.onKeyDown)
    };
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...childProps, ref: mergedRef });
  }

  return React.createElement('button', { type: 'button', ...triggerProps, ref: forwardedRef }, children);
});
Trigger.displayName = 'SelectTrigger';

const Icon = React.forwardRef(function SelectIcon({ asChild = false, children, ...props }, forwardedRef) {
  if (asChild && React.isValidElement(children)) {
    const mergedRef = mergeRefs(children.ref, forwardedRef);
    return React.cloneElement(children, { ...props, ref: mergedRef });
  }

  return React.createElement('span', { ...props, ref: forwardedRef, 'aria-hidden': true }, children);
});
Icon.displayName = 'SelectIcon';

const Portal = ({ children, container }) => {
  const { open } = useSelectContext('SelectPortal');
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
Portal.displayName = 'SelectPortal';

const Content = React.forwardRef(function SelectContent({ asChild = false, children, ...props }, forwardedRef) {
  const { open, setOpen } = useSelectContext('SelectContent');
  const localRef = React.useRef(null);
  const mergedRef = mergeRefs(localRef, forwardedRef);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event) => {
      if (!localRef.current || localRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = {
      ...children.props,
      ...props,
      ref: mergeRefs(children.ref, mergedRef)
    };
    return React.cloneElement(children, childProps);
  }

  return React.createElement('div', { ...props, ref: mergedRef, role: 'presentation' }, children);
});
Content.displayName = 'SelectContent';

const Viewport = React.forwardRef(function SelectViewport({ children, ...props }, forwardedRef) {
  return React.createElement('div', { ...props, ref: forwardedRef, role: 'listbox', tabIndex: -1 }, children);
});
Viewport.displayName = 'SelectViewport';

const Group = React.forwardRef(function SelectGroup({ children, ...props }, forwardedRef) {
  return React.createElement('div', { ...props, ref: forwardedRef }, children);
});
Group.displayName = 'SelectGroup';

const Value = React.forwardRef(function SelectValue({ placeholder, children, ...props }, forwardedRef) {
  const { value, items } = useSelectContext('SelectValue');
  const label = value != null ? items.get(value) : undefined;
  const display = label ?? (children != null ? children : undefined);
  const isPlaceholder = label == null || label === '';

  return React.createElement(
    'span',
    {
      ...props,
      ref: forwardedRef,
      'data-placeholder': isPlaceholder ? '' : undefined
    },
    display ?? placeholder ?? ''
  );
});
Value.displayName = 'SelectValue';

const Item = React.forwardRef(function SelectItem({ value, disabled = false, textValue, children, ...props }, forwardedRef) {
  const { value: selectedValue, setValue, setOpen, registerItem, setItemLabel } = useSelectContext('SelectItem');

  React.useEffect(() => registerItem(value), [registerItem, value]);
  React.useEffect(() => {
    if (textValue != null) {
      setItemLabel(value, textValue);
    }
  }, [setItemLabel, textValue, value]);

  const isSelected = selectedValue === value;

  const context = React.useMemo(
    () => ({
      value,
      isSelected,
      disabled,
      setItemLabel
    }),
    [value, isSelected, disabled, setItemLabel]
  );

  const handleSelect = () => {
    if (disabled) {
      return;
    }
    setValue(value);
    setOpen(false);
  };

  return React.createElement(
    SelectItemContext.Provider,
    { value: context },
    React.createElement(
      'div',
      {
        ...props,
        ref: forwardedRef,
        role: 'option',
        tabIndex: disabled ? -1 : 0,
        'data-state': isSelected ? 'checked' : 'unchecked',
        'data-disabled': disabled ? '' : undefined,
        'aria-selected': isSelected,
        'aria-disabled': disabled || undefined,
        onClick: composeEventHandlers(props.onClick, (event) => {
          if (event.defaultPrevented) {
            return;
          }
          handleSelect();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
          }
        })
      },
      children
    )
  );
});
Item.displayName = 'SelectItem';

const ItemText = React.forwardRef(function SelectItemText({ children, ...props }, forwardedRef) {
  const itemContext = React.useContext(SelectItemContext);
  const text = React.useMemo(() => {
    return React.Children.toArray(children)
      .map((child) => (typeof child === 'string' ? child : ''))
      .join('')
      .trim();
  }, [children]);

  React.useEffect(() => {
    if (itemContext && text) {
      itemContext.setItemLabel(itemContext.value, text);
    }
  }, [itemContext, text]);

  return React.createElement('span', { ...props, ref: forwardedRef }, children);
});
ItemText.displayName = 'SelectItemText';

const ItemIndicator = React.forwardRef(function SelectItemIndicator({ children, ...props }, forwardedRef) {
  const itemContext = React.useContext(SelectItemContext);
  if (!itemContext || !itemContext.isSelected) {
    return null;
  }

  return React.createElement('span', { ...props, ref: forwardedRef, 'aria-hidden': true }, children);
});
ItemIndicator.displayName = 'SelectItemIndicator';

module.exports = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Item,
  ItemText,
  ItemIndicator
};
