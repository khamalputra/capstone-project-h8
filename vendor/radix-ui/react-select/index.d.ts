import * as React from 'react';

export interface SelectRootProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  value?: string;
  defaultValue?: string;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  name?: string;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export interface SelectIconProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: React.ReactNode;
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  textValue?: string;
}

export interface SelectItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export interface SelectItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const Root: React.FC<SelectRootProps>;
export const Trigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<HTMLElement>>;
export const Value: React.ForwardRefExoticComponent<SelectValueProps & React.RefAttributes<HTMLSpanElement>>;
export const Icon: React.ForwardRefExoticComponent<SelectIconProps & React.RefAttributes<HTMLElement>>;
export const Portal: React.FC<{ container?: Element | null; children?: React.ReactNode }>;
export const Content: React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<HTMLDivElement>>;
export const Viewport: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export const Group: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export const Item: React.ForwardRefExoticComponent<SelectItemProps & React.RefAttributes<HTMLDivElement>>;
export const ItemText: React.ForwardRefExoticComponent<SelectItemTextProps & React.RefAttributes<HTMLSpanElement>>;
export const ItemIndicator: React.ForwardRefExoticComponent<SelectItemIndicatorProps & React.RefAttributes<HTMLSpanElement>>;
