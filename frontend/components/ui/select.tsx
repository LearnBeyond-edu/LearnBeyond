"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface SelectCtx {
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectCtx>({
  value: "",
  onValueChange: () => {},
});

// ─── Select (Root) ────────────────────────────────────────────────────────────
/**
 * Hybrid styled-trigger + invisible native <select> overlay.
 * Maintains full shadcn/ui Select API compatibility while using native browser
 * select for real interaction (accessible, mobile-friendly, keyboard-navigable).
 *
 * Usage:
 *   <Select onValueChange={fn}>
 *     <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Option A</SelectItem>
 *     </SelectContent>
 *   </Select>
 */
export function Select({ children, value, defaultValue = "", onValueChange, disabled }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value ?? "") : internalValue;

  const handleChange = React.useCallback(
    (v: string) => {
      if (!controlled) setInternalValue(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange]
  );

  // ── Collect SelectItems from the children tree ──────────────────────────────
  const items = React.useMemo(() => {
    const result: { value: string; label: string; disabled?: boolean }[] = [];

    const collect = (nodes: React.ReactNode) => {
      React.Children.forEach(nodes, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<any>;
        
        // Use duck-typing for HMR safety. Hot Module Replacement changes function identities, 
        // so `el.type === SelectItem` fails. We check for a `value` prop instead.
        if (el.props && el.props.value !== undefined && (el.type === SelectItem || (el.type as any)?.name === "SelectItem" || el.props.className?.includes("text-xs") || !el.props.children?.map)) {
          result.push({
            value: el.props.value,
            label:
              typeof el.props.children === "string"
                ? el.props.children
                : String(el.props.value),
            disabled: el.props.disabled,
          });
        } else if (el.props && el.props.children) {
          collect(el.props.children);
        }
      });
    };

    collect(children);
    return result;
  }, [children]);

  // ── Resolve placeholder from SelectValue ────────────────────────────────────
  const placeholder = React.useMemo(() => {
    let found = "Select…";
    const find = (nodes: React.ReactNode): void => {
      React.Children.forEach(nodes, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<any>;
        if (el.type === SelectValue) {
          found = el.props.placeholder || "Select…";
          return;
        }
        if (el.props?.children) find(el.props.children);
      });
    };
    find(children);
    return found;
  }, [children]);

  const currentLabel = items.find((i) => i.value === current)?.label ?? "";

  return (
    <SelectContext.Provider value={{ value: current, onValueChange: handleChange, disabled }}>
      <div className="relative w-full">
        {/* ── Decorative visible trigger ───────────────────────── */}
        <div
          aria-hidden="true"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm pointer-events-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "truncate flex-1 text-left",
              !current && "text-muted-foreground"
            )}
          >
            {currentLabel || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>

        {/* ── Invisible native <select> overlay ───────────────── */}
        <select
          value={current}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10 text-black"
          aria-label="Select option"
        >
          <option value="" disabled hidden />
          {items.map((item) => (
            <option key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </SelectContext.Provider>
  );
}

// ─── SelectTrigger (decorative; no-op at runtime since Select renders its own) ─
export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  // When used inside Select, this is invisible (Select renders its own trigger).
  // Kept for API compatibility.
  return <>{children}</>;
}

// ─── SelectValue ──────────────────────────────────────────────────────────────
export function SelectValue({ placeholder }: { placeholder?: string }) {
  // Consumed by Select to resolve the placeholder string.
  const { value } = React.useContext(SelectContext);
  return (
    <span className={cn(!value ? "text-muted-foreground" : "")}>
      {value || placeholder || "Select…"}
    </span>
  );
}

// ─── SelectContent ────────────────────────────────────────────────────────────
export function SelectContent({ children }: { children: React.ReactNode }) {
  // Items are collected by Select via React.Children — this is a no-op renderer.
  return null;
}

// ─── SelectItem ───────────────────────────────────────────────────────────────
export function SelectItem({ value, children, disabled, className }: SelectItemProps) {
  // Collected by Select.useMemo — never directly rendered in DOM.
  return null;
}

// ─── SelectGroup (optional grouping wrapper) ──────────────────────────────────
export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── SelectLabel ──────────────────────────────────────────────────────────────
export function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return null;
}

// ─── SelectSeparator ──────────────────────────────────────────────────────────
export function SelectSeparator({ className }: { className?: string }) {
  return null;
}
