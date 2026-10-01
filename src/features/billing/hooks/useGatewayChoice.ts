import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context";
import type { Currency, PaymentGateway } from "@/shared/types";

function isValidMobile(phone: string): boolean {
  return phone.replace(/\D/g, "").replace(/^(0|91)(?=\d{10}$)/, "").length === 10;
}

export function useGatewayChoice(currency: Currency) {
  const { user } = useAuth();
  const [gateway, setGateway] = useState<PaymentGateway>("razorpay");
  const [phone, setPhone] = useState(user?.mobile ?? "");
  const cashfreeDisabled = currency !== "INR";

  useEffect(() => {
    if (cashfreeDisabled && gateway === "cashfree") setGateway("razorpay");
  }, [cashfreeDisabled, gateway]);

  const canPay = gateway !== "cashfree" || (!cashfreeDisabled && isValidMobile(phone));
  const phoneForGateway = gateway === "cashfree" ? phone : undefined;

  return { gateway, setGateway, phone, setPhone, cashfreeDisabled, canPay, phoneForGateway };
}

export type GatewayChoice = ReturnType<typeof useGatewayChoice>;
