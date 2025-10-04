import * as React from 'react';

export interface DialogProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent | MouseEvent) => void;
}

export interface DialogHeadingProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const Root: React.FC<DialogProps>;
export const Trigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLElement>>;
export const Portal: React.FC<{ container?: Element | null; children?: React.ReactNode }>;
export const Overlay: React.ForwardRefExoticComponent<DialogOverlayProps & React.RefAttributes<HTMLDivElement>>;
export const Content: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
export const Title: React.ForwardRefExoticComponent<DialogHeadingProps & React.RefAttributes<HTMLElement>>;
export const Description: React.ForwardRefExoticComponent<DialogHeadingProps & React.RefAttributes<HTMLElement>>;
export const Close: React.ForwardRefExoticComponent<DialogCloseProps & React.RefAttributes<HTMLElement>>;
