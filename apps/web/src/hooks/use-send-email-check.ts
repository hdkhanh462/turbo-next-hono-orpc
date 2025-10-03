"use client";

import { useEffect, useState } from "react";

import useLocalStorage from "@/hooks/use-local-storage";

const RESEND_EMAIL_INTERVAL_MINUTE = 1;

type Options = {
  type: "verify" | "reset";
};

export default function useSendEmailCheck(
  { type }: Options = { type: "verify" }
) {
  const [canSendEmail, setCanSendEmail] = useState(true);
  const [sentEmailExp, setSentEmailExp] = useLocalStorage<number>(
    `sentEmailExp-${type}`,
    null
  );

  const onSendEmail = () => {
    const exp = Date.now() + RESEND_EMAIL_INTERVAL_MINUTE * 60 * 1000;
    setSentEmailExp(exp);
    setCanSendEmail(false);
  };

  useEffect(() => {
    if (sentEmailExp && sentEmailExp > Date.now()) {
      setCanSendEmail(false);
    }
  }, [sentEmailExp]);

  return { canSendEmail, sentEmailExp, setCanSendEmail, onSendEmail };
}
