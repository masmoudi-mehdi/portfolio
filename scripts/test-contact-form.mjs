#!/usr/bin/env node
// Tests every state of the contact form with a MOCKED Formspree: no message is
// ever sent. Any request leaving localhost is blocked, and the Formspree URL is
// answered by the script itself.
//   npm run build && npm run preview      (in another terminal)
//   node scripts/test-contact-form.mjs [--base http://localhost:4321]
// Exits with code 1 if a check fails.

import { chromium } from "playwright";

const BASE = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : (process.env.BASE_URL ?? "http://localhost:4321");
const PAGES = [
  { path: "/", lang: "fr", sending: "Envoi en cours" },
  { path: "/en/", lang: "en", sending: "Sending" },
  { path: "/en/services", lang: "en", sending: "Sending" },
];

const failures = [];
let checks = 0;
const check = (name, ok, detail = "") => {
  checks++;
  if (!ok) failures.push(`${name}${detail ? ` (${detail})` : ""}`);
};

const browser = await chromium.launch();

for (const { path, lang, sending } of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const label = (what) => `${path} ${what}`;

  // Safety net: nothing but the local preview may be reached.
  const blocked = [];
  await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => {
    if (!/formspree\.io/.test(route.request().url())) {
      blocked.push(route.request().url());
      return route.abort();
    }
    return route.fallback();
  });

  /** What the mocked Formspree answers next; "network" simulates a lost connection. */
  let next = { status: 200, delay: 0 };
  const received = [];
  await page.route(/formspree\.io/, async (route) => {
    const request = route.request();
    received.push({ method: request.method(), body: request.postData() ?? "", accept: request.headers().accept });
    if (next.delay) await new Promise((r) => setTimeout(r, next.delay));
    if (next.status === "network") return route.abort("connectionfailed");
    await route.fulfill({
      status: next.status,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(next.status < 400 ? { ok: true } : { error: "mocked" }),
    });
  });

  await page.goto(BASE + path, { waitUntil: "load" });
  const form = page.locator("[data-contact-form]");
  const name = form.locator("input[name=name]");
  const email = form.locator("input[name=email]");
  const message = form.locator("textarea");
  const button = form.locator("button[type=submit]");
  const success = form.locator("[data-status=success]");
  const failed = form.locator("[data-status=error]");
  const errorOf = (field) => form.locator(`[data-error-for=${field}]`);
  const fill = async (n = "Test Person", e = "test@example.com", m = "Hello, this is a mocked message.") => {
    await name.fill(n);
    await email.fill(e);
    await message.fill(m);
  };

  await form.scrollIntoViewIfNeeded();

  // Accessibility basics: every field has a label and a placeholder-independent name.
  for (const field of [name, email, message]) {
    const id = await field.getAttribute("id");
    check(label(`field ${id} has a <label for>`), (await page.locator(`label[for="${id}"]`).count()) === 1);
  }

  // 1. Empty submit: three inline errors, focus on the first field, nothing sent.
  await button.click();
  check(label("empty: name error shown"), await errorOf("name").isVisible());
  check(label("empty: email error shown"), await errorOf("email").isVisible());
  check(label("empty: message error shown"), await errorOf("message").isVisible());
  check(label("empty: aria-invalid on name"), (await name.getAttribute("aria-invalid")) !== null);
  check(label("empty: error linked with aria-describedby"), (await name.getAttribute("aria-describedby")) === (await errorOf("name").getAttribute("id")));
  check(label("empty: focus on first invalid field"), await name.evaluate((el) => el === document.activeElement));
  check(label("empty: nothing sent"), received.length === 0);
  check(label("empty: error text is in the page language"), (await errorOf("name").innerText()).includes(lang === "fr" ? "obligatoire" : "required"));

  // 2. Invalid email: only the email error, and focus moves to it.
  await fill("Test Person", "not-an-email");
  await button.click();
  check(label("bad email: email error shown"), await errorOf("email").isVisible());
  check(label("bad email: name error cleared"), !(await errorOf("name").isVisible()));
  check(label("bad email: focus on email"), await email.evaluate((el) => el === document.activeElement));
  check(label("bad email: nothing sent"), received.length === 0);

  // The error goes away as soon as the value is fixed.
  await email.fill("test@example.com");
  check(label("fixing the email clears its error"), !(await errorOf("email").isVisible()) && (await email.getAttribute("aria-invalid")) === null);

  // 3. Server error: failure message, the visitor's text is kept.
  next = { status: 500, delay: 0 };
  await button.click();
  await failed.waitFor({ state: "visible" });
  check(label("500: error message shown"), await failed.isVisible());
  check(label("500: success message hidden"), !(await success.isVisible()));
  check(label("500: text kept"), (await message.inputValue()) === "Hello, this is a mocked message.");
  check(label("500: button usable again"), await button.isEnabled());

  // 4. Lost connection.
  next = { status: "network", delay: 0 };
  await button.click();
  await page.waitForFunction(() => !document.querySelector("[data-contact-form] button[type=submit]").disabled);
  check(label("network failure: error message shown"), await failed.isVisible());

  // 5. Success, with a slow answer to see the "sending" state.
  next = { status: 200, delay: 700 };
  await button.click();
  check(label("sending: button disabled"), await button.isDisabled());
  check(label("sending: button label says so"), (await button.innerText()).includes(sending));
  check(label("sending: old error hidden"), !(await failed.isVisible()));
  await success.waitFor({ state: "visible" });
  check(label("success: message shown"), await success.isVisible());
  check(label("success: error hidden"), !(await failed.isVisible()));
  check(label("success: form emptied"), (await name.inputValue()) === "" && (await message.inputValue()) === "");
  check(label("success: button back to normal"), (await button.isEnabled()) && !(await button.innerText()).includes(sending));
  check(label("success: announced in the live region"), ((await form.locator("[data-live]").textContent()) ?? "").length > 10);

  // What the mocked endpoint received on the last (successful) submit.
  const last = received.at(-1);
  check(label("request: POST"), last?.method === "POST");
  check(label("request: asks for JSON"), /application\/json/.test(last?.accept ?? ""));
  check(label("request: carries the three fields"), /name="name"[\s\S]*Test Person/.test(last?.body) && /name="email"[\s\S]*test@example\.com/.test(last?.body) && /name="message"/.test(last?.body));
  check(label("request: honeypot sent empty"), /name="_gotcha"\r?\n\r?\n\r?\n/.test(last?.body) || /name="_gotcha"\s*\r?\n\r?\n--/.test(last?.body));
  check(label("requests: 3 submissions reached the mock (500, network, 200)"), received.length === 3, String(received.length));

  check(label("nothing left localhost except the mocked form"), blocked.every((u) => /goatcounter|zgo\.at/.test(u)), blocked.join(", "));
  await context.close();
}

await browser.close();
console.log(`${checks - failures.length}/${checks} checks passed.`);
if (failures.length) {
  console.error(`\n${failures.length} failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
