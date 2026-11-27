import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const Button = () => null;
const Input = () => null;
const Link = () => null;
const Image = () => null;
const Wrench = () => null;
const SectionHeading = () => null;
const RequestActionsStub = () => null;
const DialogRoot = () => null;
const DialogPortal = () => null;
const DialogBackdrop = () => null;
const DialogPopup = () => null;
const DialogTitle = () => null;
const DialogDescription = () => null;
const DialogClose = () => null;

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

function collect(node, predicate) {
  if (!node || typeof node !== "object") return [];
  const children = node.props?.children;
  return [
    ...(predicate(node) ? [node] : []),
    ...(Array.isArray(children) ? children : [children]).flatMap((child) => collect(child, predicate)),
  ];
}

function button(tree, text) {
  return collect(tree, (node) => node.type === Button && node.props.children === text)[0];
}

function actionHarness(id, initialStatus = "requested") {
  const booking = { _id: id, serviceTitle: "AC repair", status: initialStatus, basePrice: 1200, paymentStatus: "unpaid" };
  const slots = [];
  const calls = [];
  const messages = [];
  let cursor = 0;
  let refreshes = 0;
  let serverStatus = initialStatus;
  const stateHook = (initial) => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], (next) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
  };
  const fetch = async (url, options) => {
    calls.push({ url, options });
    if (url === "/api/access-token") return { ok: true, json: async () => ({ accessToken: "test-jwt" }) };
    assert.equal(url, `/api/bookings/${id}/status`);
    assert.equal(options.method, "PATCH");
    assert.equal(options.headers.authorization, "Bearer test-jwt");
    const body = JSON.parse(options.body);
    const allowed = { requested: ["accepted", "rejected"], accepted: ["in-progress"], "in-progress": ["completed"] };
    assert.ok(allowed[serverStatus]?.includes(body.status));
    if (body.status === "completed") assert.ok(body.finalAmount > 0);
    serverStatus = body.status;
    return { ok: true, json: async () => ({ status: serverStatus }) };
  };
  const { RequestActions } = load("src/components/dashboard/request-actions.tsx", {
    "@base-ui/react/alert-dialog": {
      AlertDialog: {
        Root: DialogRoot, Portal: DialogPortal, Backdrop: DialogBackdrop, Popup: DialogPopup,
        Title: DialogTitle, Description: DialogDescription, Close: DialogClose,
      },
    },
    "next/navigation": { useRouter: () => ({ refresh: () => { refreshes += 1; } }) },
    react: { useState: stateHook, useEffect: () => {}, useId: () => `amount-${id}` },
    sonner: { toast: { success: (message) => messages.push(message), error: (message) => messages.push(`ERROR: ${message}`) } },
    "@/components/ui/button": { Button },
    "@/components/ui/input": { Input },
  }, { fetch });
  return {
    render: () => { cursor = 0; return RequestActions({ booking }); },
    calls, messages, get refreshes() { return refreshes; }, get serverStatus() { return serverStatus; },
  };
}

test("desktop table and mobile cards both include request actions", async () => {
  const bookings = [
    { _id: "first", status: "requested", serviceTitle: "AC repair" },
    { _id: "second", status: "requested", serviceTitle: "TV repair" },
  ];
  const { default: Page } = load("src/app/(dashboard)/dashboard/technician/requests/page.tsx", {
    "lucide-react": { Wrench },
    "next/image": { __esModule: true, default: Image },
    "next/link": { __esModule: true, default: Link },
    "next/navigation": { redirect: () => { throw new Error("Unexpected redirect"); } },
    "@/components/dashboard/request-actions": { RequestActions: RequestActionsStub },
    "@/components/ui/section-heading": { SectionHeading },
    "@/lib/auth-roles": { dashboardPathForRole: () => "/dashboard/technician" },
    "@/lib/server-auth": { getAuthSession: async () => ({ user: { role: "technician" } }) },
    "@/lib/technician-requests": { getTechnicianRequests: async (status) => {
      assert.equal(status, "all");
      return bookings;
    } },
  });
  const tree = await Page({ searchParams: Promise.resolve({ status: "all" }) });
  const mobile = collect(tree, (node) => node.type === "ul" && node.props?.className?.includes("lg:hidden"))[0];
  const desktop = collect(tree, (node) => node.type === "div" && node.props?.className?.includes("lg:block") && node.props.className.includes("overflow-x-auto"))[0];
  assert.deepEqual(collect(mobile, (node) => node.type === RequestActionsStub).map((node) => node.props.booking._id), ["first", "second"]);
  assert.deepEqual(collect(desktop, (node) => node.type === RequestActionsStub).map((node) => node.props.booking._id), ["first", "second"]);
});

test("completed, rejected and cancelled requests have no actions", () => {
  for (const status of ["completed", "rejected", "cancelled"]) {
    const tree = actionHarness(`terminal-${status}`, status).render();
    assert.equal(collect(tree, (node) => node.type === Button).length, 0);
    const paymentBadges = collect(tree, (node) => Array.isArray(node.props?.children) && node.props.children.join("") === "Payment: Unpaid");
    assert.equal(paymentBadges.length, status === "completed" ? 1 : 0);
  }
});

for (const layout of ["desktop", "mobile"]) {
  test(`${layout}: accept, start work, then complete with a valid amount`, async () => {
    const harness = actionHarness(`${layout}-first`);
    await button(harness.render(), "Accept").props.onClick();
    assert.equal(harness.serverStatus, "accepted");
    await button(harness.render(), "Start Work").props.onClick();
    assert.equal(harness.serverStatus, "in-progress");

    button(harness.render(), "Mark Completed").props.onClick();
    let tree = harness.render();
    const input = collect(tree, (node) => node.type === Input)[0];
    assert.equal(input.props.value, "1200");
    input.props.onChange({ target: { value: "0" } });
    tree = harness.render();
    await collect(tree, (node) => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
    assert.equal(harness.serverStatus, "in-progress");
    assert.ok(collect(harness.render(), (node) => node.props?.role === "alert").length > 0);

    collect(harness.render(), (node) => node.type === Input)[0].props.onChange({ target: { value: "1500" } });
    await collect(harness.render(), (node) => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
    assert.equal(harness.serverStatus, "completed");
    const patchCalls = harness.calls.filter((call) => call.url.endsWith("/status"));
    assert.deepEqual(patchCalls.map((call) => JSON.parse(call.options.body).status), ["accepted", "in-progress", "completed"]);
    assert.equal(JSON.parse(patchCalls[2].options.body).finalAmount, 1500);
    tree = harness.render();
    assert.equal(button(tree, "Accept"), undefined);
    assert.equal(button(tree, "Mark Completed"), undefined);
    assert.ok(collect(tree, (node) => Array.isArray(node.props?.children) && node.props.children.join("") === "Payment: Unpaid").length > 0);
    assert.equal(harness.refreshes, 3);
    assert.deepEqual(harness.messages, ["Request accepted.", "Work started.", "Repair marked completed."]);
  });

  test(`${layout}: reject requires confirmation and leaves only the badge`, async () => {
    const harness = actionHarness(`${layout}-second`);
    button(harness.render(), "Reject").props.onClick();
    const dialog = collect(harness.render(), (node) => node.type === DialogRoot)[0];
    assert.equal(dialog.props.open, true);
    await button(harness.render(), "Reject Request").props.onClick();
    assert.equal(harness.serverStatus, "rejected");
    assert.equal(button(harness.render(), "Reject"), undefined);
    assert.equal(harness.refreshes, 1);
    assert.deepEqual(harness.messages, ["Request rejected."]);
  });
}
