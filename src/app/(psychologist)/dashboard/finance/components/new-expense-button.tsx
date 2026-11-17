"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";

export function NewExpenseButton() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  return (
    <>
      <Button size="lg" onClick={handleOpen}>
        <Plus aria-hidden />
        Nova despesa
      </Button>
      <ExpenseFormDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
