import assert from "node:assert/strict";
import { test } from "node:test";
import { customerBookingStats } from "../src/lib/customer-booking-stats.ts";

test("overview counts the same bookings shown by My Bookings", () => {
  const myBookings = [
    { status: "requested" },
    { status: "requested" },
    { status: "accepted" },
    { status: "in-progress" },
    { status: "completed" },
    { status: "cancelled" },
  ];
  const stats = customerBookingStats(myBookings);
  assert.equal(stats.total, myBookings.length);
  assert.equal(stats.active, 4);
  assert.equal(stats.completed, 1);
  assert.deepEqual(stats.byStatus.map(({ key, count }) => [key, count]), [
    ["requested", 2], ["accepted", 1], ["in-progress", 1],
    ["completed", 1], ["rejected", 0], ["cancelled", 1],
  ]);
  assert.equal(stats.byStatus.reduce((sum, row) => sum + row.count, 0), myBookings.length);
});

test("empty bookings return zero cards and zero chart data", () => {
  const stats = customerBookingStats([]);
  assert.equal(stats.total, 0);
  assert.equal(stats.active, 0);
  assert.equal(stats.completed, 0);
  assert.ok(stats.byStatus.every((row) => row.count === 0));
});
