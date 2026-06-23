"use client";

import type { Patient } from "@queue-cure/shared";

export function TokenQRCode({ patient }: { patient: Patient }) {
  const url =
    typeof window === "undefined"
      ? patient.trackingUrl ?? ""
      : `${window.location.origin}${patient.trackingUrl ?? `/waiting-room?token=${patient.tokenNumber}`}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(url)}`;

  return (
    <a
      href={url}
      className="block rounded-md border border-white/10 bg-white p-2 text-slate-950"
      aria-label={`Open tracking link for token ${patient.tokenNumber}`}
    >
      <img src={qrUrl} alt={`QR code for token ${patient.tokenNumber}`} className="size-24" />
    </a>
  );
}
