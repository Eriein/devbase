"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateItemDialog } from "@/components/dashboard/DashboardShell";

interface NewItemButtonProps {
  typeId: string;
  typeName: string;
  color: string;
}

export function NewItemButton({ typeId, typeName, color }: NewItemButtonProps) {
  const { openCreateDialog } = useCreateItemDialog();

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 border font-medium"
      style={{
        backgroundColor: color + "15",
        borderColor: color + "50",
        color,
      }}
      onClick={() => openCreateDialog(typeId)}
    >
      <Plus className="size-3.5" />
      New {typeName}
    </Button>
  );
}
