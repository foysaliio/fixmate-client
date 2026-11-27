import assert from "node:assert/strict";
import { test } from "node:test";
import { technicianOverviewStats } from "../src/lib/technician-overview-stats.ts";

test("overview matches My Services and Manage Requests counts", () => {
  const myServices = [
    { approvalStatus: "approved" },
    { approvalStatus: "approved" },
    { approvalStatus: "pending" },
    { approvalStatus: "rejected" },
  ];
  const manageRequests = [
    { status: "requested" },
    { status: "requested" },
    { status: "accepted" },
    { status: "in-progress" },
    { status: "completed" },
    { status: "rejected" },
  ];
  const stats = technicianOverviewStats(myServices, manageRequests);
  assert.equal(stats.totalServices, myServices.length);
  assert.equal(stats.approvedServices, 2);
  assert.equal(stats.pendingRequests, 2);
  assert.deepEqual(stats.byStatus.map(({ key, count }) => [key, count]), [
    ["requested", 2], ["accepted", 1], ["in-progress", 1], ["completed", 1],
  ]);
});

test("empty services and requests give zero cards and empty chart data", () => {
  const stats = technicianOverviewStats([], []);
  assert.equal(stats.totalServices, 0);
  assert.equal(stats.approvedServices, 0);
  assert.equal(stats.pendingRequests, 0);
  assert.ok(stats.byStatus.every(({ count }) => count === 0));
});
