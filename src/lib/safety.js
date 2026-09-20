import http from 'node:http';

// A deliberately vulnerable app must not run where it can hurt someone.
// This is a seatbelt, not a permission slip.
export async function safetyCheck({ host }) {
  const bindingWide = host === '0.0.0.0' || host === '::';
  const override = process.env.FF_I_KNOW_WHAT_IM_DOING === '1';

  if (bindingWide && !override) {
    // Wide binding is allowed for local Docker (-p maps it), but we still warn.
    console.warn(
      '\n  ⚠  SourCode is binding to a non-loopback address.\n' +
      '     This app is INTENTIONALLY VULNERABLE. Only do this on an isolated,\n' +
      '     private machine you own. Never expose it to the internet.\n'
    );
  }

  // Best-effort: bail out on a public cloud instance unless overridden.
  if (!override && await looksLikeCloud()) {
    console.error(
      '\n  ✗ Refusing to start: this looks like a public cloud instance.\n' +
      '    SourCode is deliberately insecure and must not run here.\n' +
      '    If this is an isolated lab you fully control, set\n' +
      '    FF_I_KNOW_WHAT_IM_DOING=1 to override.\n'
    );
    process.exit(1);
  }
}

// Probe the cloud metadata endpoint (link-local, 250ms timeout).
function looksLikeCloud() {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '169.254.169.254', path: '/', timeout: 250 },
      (res) => { res.destroy(); resolve(true); }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}
