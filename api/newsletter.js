const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskEmail(email) {
  const [localPart = "", domainPart = ""] = String(email).split("@");
  const safeLocal = localPart ? `${localPart[0]}***` : "***";
  const safeDomain = domainPart ? `${domainPart[0]}***` : "***";
  return `${safeLocal}@${safeDomain}`;
}

function parseEmailFromBody(req) {
  const contentType = (req.headers["content-type"] || "").split(";")[0].trim();
  const body = req.body;

  if (contentType === "application/json") {
    if (typeof body === "string") {
      try {
        return JSON.parse(body).email?.trim() || "";
      } catch {
        return "";
      }
    }

    if (body && typeof body === "object") {
      return String(body.email || "").trim();
    }
  }

  if (contentType === "application/x-www-form-urlencoded") {
    if (typeof body === "string") {
      return new URLSearchParams(body).get("email")?.trim() || "";
    }

    if (body && typeof body === "object") {
      return String(body.email || "").trim();
    }
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body).email?.trim() || "";
    } catch {
      return new URLSearchParams(body).get("email")?.trim() || "";
    }
  }

  if (body && typeof body === "object") {
    return String(body.email || "").trim();
  }

  return "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const email = parseEmailFromBody(req);
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("[newsletter] missing BUTTONDOWN_API_KEY");
    return res.status(502).json({ error: "Falha ao processar inscrição no momento." });
  }

  const rawTag = process.env.BUTTONDOWN_TAG || "";
  const tags = rawTag
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  try {
    const payload = tags.length > 0 ? { email_address: email, tags } : { email_address: email };

    const buttondownResponse = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (buttondownResponse.ok) {
      return res.status(200).json({
        ok: true,
        message: "Inscrição realizada. Verifique seu e-mail para confirmar.",
      });
    }

    const errorPayload = await buttondownResponse.json().catch(() => ({}));
    const hasClientError = buttondownResponse.status >= 400 && buttondownResponse.status < 500;

    console.error("[newsletter] buttondown request failed", {
      status: buttondownResponse.status,
      email: maskEmail(email),
    });

    if (hasClientError) {
      let message = "Não foi possível concluir a inscrição com este e-mail.";
      if (typeof errorPayload.detail === "string") {
        message = errorPayload.detail;
      } else if (Array.isArray(errorPayload.email_address) && errorPayload.email_address[0]) {
        message = String(errorPayload.email_address[0]);
      } else if (typeof errorPayload.error === "string") {
        message = errorPayload.error;
      }
      return res.status(400).json({ error: message });
    }

    return res.status(502).json({ error: "Falha ao processar inscrição no momento." });
  } catch (error) {
    console.error("[newsletter] unexpected error", {
      error: error instanceof Error ? error.message : "unknown",
      email: maskEmail(email),
    });
    return res.status(502).json({ error: "Falha ao processar inscrição no momento." });
  }
}
