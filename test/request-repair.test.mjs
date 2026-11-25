import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const serviceId = "507f1f77bcf86cd799439011";
const returnTo = `/services/${serviceId}`;
const user = { name: "Customer", email: "customer@example.com", role: "customer" };
const Button = () => null;
const Input = () => null;
const Link = () => null;
const SignInForm = () => null;
const SectionHeading = () => null;

function load(sourcePath, modules, globals = {}) {
  const source = readFileSync(resolve(sourcePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  runInNewContext(output, {
    exports,
    require: (name) => name === "react/jsx-runtime" ? require(name) : modules[name],
    ...globals,
  }, { filename: sourcePath });
  return exports;
}

function find(node, predicate) {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  const children = node.props?.children;
  return (Array.isArray(children) ? children : [children]).map((child) => find(child, predicate)).find(Boolean);
}

function repairModule({ fetch, messages = [], formValues = {} } = {}) {
  return load("src/components/services/request-repair.tsx", {
    react: { useState: (initial) => [initial, () => {}] },
    "next/link": { __esModule: true, default: Link },
    sonner: { toast: { success: (message) => messages.push(message), error: (message) => messages.push(message) } },
    "@/components/ui/button": { Button },
    "@/components/ui/input": { Input },
  }, { fetch, FormData: class { get(key) { return formValues[key]; } } });
}

test("guest Request Repair links to sign-in with the same service return path", () => {
  const { RequestRepair } = repairModule();
  const tree = RequestRepair({ serviceId, user: null });
  const button = find(tree, (node) => node.type === Button);
  assert.equal(button.props.render.type, Link);
  assert.equal(button.props.render.props.href, `/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
});

test("technicians and admins see the customer-only message", () => {
  const { RequestRepair } = repairModule();
  for (const role of ["technician", "admin"]) {
    const tree = RequestRepair({ serviceId, user: { ...user, role } });
    const message = find(tree, (node) => node.props?.role === "status");
    assert.equal(message.props.children, "Only customers can request a repair");
    assert.equal(find(tree, (node) => node.type === "form"), undefined);
  }
});

test("sign-in accepts the service return path and ignores unsafe paths", async () => {
  const { default: SignInPage } = load("src/app/(public)/sign-in/page.tsx", {
    "next/navigation": { redirect: () => {} },
    "@/components/auth/sign-in-form": { SignInForm },
    "@/lib/auth-roles": { dashboardPathForRole: () => "/dashboard/customer" },
    "@/lib/server-auth": { getAuthSession: async () => null },
  });
  const page = await SignInPage({ searchParams: Promise.resolve({ returnTo }) });
  assert.equal(page.props.returnTo, returnTo);
  const unsafe = await SignInPage({ searchParams: Promise.resolve({ returnTo: "//evil.example" }) });
  assert.equal(unsafe.props.returnTo, undefined);
});

test("successful sign-in returns to the requested service", async () => {
  const destinations = [];
  const state = ["customer@example.com", "Password123", false, false, "", false];
  const { SignInForm: Form } = load("src/components/auth/sign-in-form.tsx", {
    react: { useState: () => [state.shift(), () => {}] },
    "next/link": { __esModule: true, default: Link },
    "next/navigation": { useRouter: () => ({ replace: (path) => destinations.push(path) }) },
    sonner: { toast: { success: () => {} } },
    "@/components/auth/password-input": { PasswordInput: Input },
    "@/components/ui/button": { Button },
    "@/components/ui/section-heading": { SectionHeading },
    "@/lib/auth-client": { authClient: { signIn: { email: async () => ({ data: { user: { role: "customer" } } }) } } },
    "@/lib/auth-roles": { dashboardPathForRole: () => "/dashboard/customer" },
  });
  const form = find(Form({ returnTo }), (node) => node.type === "form");
  await form.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(destinations, [returnTo]);
});

test("customer submit sends JWT booking payload and explains duplicate 409", async () => {
  const requests = [];
  const messages = [];
  let status = 201;
  const fetch = async (url, options) => {
    requests.push({ url, options });
    if (url === "/api/access-token") return { ok: true, json: async () => ({ accessToken: "test-jwt" }) };
    return { ok: status === 201, status, json: async () => ({ message: "An active booking already exists for this service" }) };
  };
  const values = {
    phone: "01700000000", address: "Dhaka", preferredDate: "2099-01-01",
    problemDescription: "The AC is not cooling properly.",
  };
  const { RequestRepair } = repairModule({ fetch, messages, formValues: values });
  const submit = async () => {
    const form = find(RequestRepair({ serviceId, user }), (node) => node.type === "form");
    await form.props.onSubmit({ preventDefault() {}, currentTarget: { reset() {} } });
  };
  await submit();
  assert.equal(requests[0].url, "/api/access-token");
  assert.equal(requests[1].url, "/api/bookings");
  assert.equal(requests[1].options.headers.authorization, "Bearer test-jwt");
  assert.equal(JSON.parse(requests[1].options.body).serviceId, serviceId);
  assert.ok(messages.includes("Repair request submitted successfully."));

  status = 409;
  await submit();
  assert.ok(messages.includes("You already have an active request for this service."));
});
