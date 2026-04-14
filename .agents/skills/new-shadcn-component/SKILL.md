---
name: new-shadcn-component
description: Installs a shadcn/ui component and creates a typed wrapper. Use when adding new UI primitives from the shadcn registry.
argument-hint: "[component-name] e.g. dialog, table, form, select"
allowed-tools: Read, Write, Bash
---

Install and scaffold the shadcn/ui component: **$ARGUMENTS**

## Steps

1. **Install the component** (if not already present):
```bash
yarn dlx shadcn@latest add $ARGUMENTS
```

2. **Verify** the installed file at `components/ui/$ARGUMENTS.tsx`.

3. **Create a composed wrapper** at `components/$ARGUMENTS/$ARGUMENTS.tsx` **only if** the component needs project-specific props, styling, or behavior (e.g., a `<ConfirmDialog>` built on top of `<Dialog>`):

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Rules
- Never edit files in `components/ui/` — they are managed by shadcn registry.
- Always use `cn()` for className merging.
- Accept and forward `className` prop from callers (composability).
- Use Radix UI primitives directly when composition is complex.
