"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ChargeItem } from "@/features/payments/charge-message";
import {
  ChargeDialog,
  type ChargeTarget,
} from "@/features/payments/components/charge-dialog";

type PatientChargeButtonProps = {
  patientName: string;
  patientPhone: string;
  items: readonly ChargeItem[];
  pixKey: string | null;
};

export function PatientChargeButton({
  patientName,
  patientPhone,
  items,
  pixKey,
}: PatientChargeButtonProps) {
  const [chargeTarget, setChargeTarget] = useState<ChargeTarget | null>(null);

  function handleOpen() {
    setChargeTarget({ patientName, patientPhone, items });
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setChargeTarget(null);
  }

  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        <MessageCircle aria-hidden />
        Cobrar
      </Button>
      <ChargeDialog
        target={chargeTarget}
        pixKey={pixKey}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
