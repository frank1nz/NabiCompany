function formatField(id, value) {
  const val = String(value ?? "");
  const length = val.length.toString().padStart(2, "0");
  return `${id}${length}${val}`;
}

function sanitizeTarget(raw) {
  if (!raw) throw new Error("PromptPay target is required");
  return String(raw).replace(/[^0-9A-Za-z]/g, "");
}

function detectProxyType(target) {
  if (/^0\d{9}$/.test(target)) return "phone";
  if (/^\d{13}$/.test(target)) return "citizen_id";
  if (/^\d{15}$/.test(target)) return "tax_or_wallet";
  return "unknown";
}

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function resolvePromptPayId(rawTarget, explicitType = "auto", bankCode = "") {
  const target = sanitizeTarget(rawTarget);
  const type = (explicitType || "auto").toLowerCase();

  const phoneId = () => {
    if (!/^0\d{9}$/.test(target)) {
      throw new Error("Phone number must have 10 digits and start with 0");
    }
    return `0066${target.substring(1)}`;
  };

  const citizenId = () => {
    if (!/^\d{13}$/.test(target)) throw new Error("Citizen ID must contain 13 digits");
    return target;
  };

  const taxOrWalletId = () => {
    if (!/^\d{15}$/.test(target)) {
      throw new Error("Tax ID / E-Wallet ID must contain 15 digits");
    }
    return target;
  };

  const bankAccountId = () => {
    const cleanedBank = String(bankCode || "").replace(/\D/g, "");
    if (cleanedBank.length !== 3) {
      throw new Error("Bank PromptPay proxy requires a 3-digit bank code");
    }
    if (!/^\d{6,12}$/.test(target)) {
      throw new Error("Bank account PromptPay proxy must have 6-12 digits");
    }
    const accountPadded = target.padStart(12, "0");
    return `${cleanedBank}${accountPadded}`;
  };

  if (type === "phone") return phoneId();
  if (type === "citizen" || type === "citizen_id") return citizenId();
  if (type === "tax" || type === "wallet" || type === "ewallet") return taxOrWalletId();
  if (type === "bank") return bankAccountId();
  if (type !== "auto") {
    throw new Error(`Unsupported PromptPay proxy type "${explicitType}"`);
  }

  switch (detectProxyType(target)) {
    case "phone":
      return phoneId();
    case "citizen_id":
      return citizenId();
    case "tax_or_wallet":
      return taxOrWalletId();
    default:
      if (bankCode) {
        return bankAccountId();
      }
      throw new Error("Unable to detect PromptPay proxy type from the provided ID");
  }
}

export function generatePromptPayPayload({
  target,
  amount,
  reference = "",
  merchantName = "",
  merchantCity = "",
  targetType = "auto",
  bankCode = "",
}) {
  const promptPayId = resolvePromptPayId(target, targetType, bankCode);
  const amountValue = Number(amount || 0);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const amountStr = amountValue.toFixed(2);
  const sanitizedReference = reference ? String(reference).replace(/[^A-Za-z0-9]/g, "") : "";
  const subfields = [
    formatField("00", "A000000677010111"),
    formatField("01", promptPayId),
  ];
  if (sanitizedReference) {
    subfields.push(formatField("02", sanitizedReference.slice(0, 25)));
  }
  const merchantAccountInfo = formatField("29", subfields.join(""));

  const payloadParts = [
    formatField("00", "01"), // Payload Format Indicator
    formatField("01", "11"), // Point of Initiation Method (dynamic)
    merchantAccountInfo,
    formatField("52", "0000"), // Merchant Category Code (default)
    formatField("53", "764"), // Transaction currency (THB)
    formatField("54", amountStr),
    formatField("58", "TH"),
  ];

  if (merchantName) {
    payloadParts.push(formatField("59", merchantName.slice(0, 25)));
  }

  if (merchantCity) {
    payloadParts.push(formatField("60", merchantCity.slice(0, 15)));
  }

  if (sanitizedReference) {
    const additional = formatField("01", sanitizedReference.slice(0, 25));
    payloadParts.push(formatField("62", additional));
  }

  const partial = `${payloadParts.join("")}6304`;
  const checksum = crc16(partial);
  return {
    payload: `${partial}${checksum}`,
    proxyId: promptPayId,
  };
}
