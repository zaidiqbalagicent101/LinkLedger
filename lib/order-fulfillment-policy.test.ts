import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFulfillmentActionFilter,
  isValidFulfillmentTransition,
} from "./order-fulfillment-policy";

describe("order fulfillment transitions", () => {
  it("allows the requested paid-order lifecycle edges", () => {
    assert.equal(isValidFulfillmentTransition("CONFIRMED", "IN_PROGRESS"), true);
    assert.equal(isValidFulfillmentTransition("IN_PROGRESS", "CONTENT_SUBMITTED"), true);
    assert.equal(isValidFulfillmentTransition("REVISION_REQUESTED", "CONTENT_SUBMITTED"), true);
    assert.equal(isValidFulfillmentTransition("CONTENT_SUBMITTED", "REVISION_REQUESTED"), true);
    assert.equal(isValidFulfillmentTransition("CONTENT_SUBMITTED", "APPROVED"), true);
    assert.equal(isValidFulfillmentTransition("APPROVED", "PUBLISHED"), true);
    assert.equal(isValidFulfillmentTransition("PUBLISHED", "COMPLETED"), true);
  });

  it("rejects skipped, reversed, and unrelated status transitions", () => {
    assert.equal(isValidFulfillmentTransition("CONFIRMED", "PUBLISHED"), false);
    assert.equal(isValidFulfillmentTransition("CONTENT_SUBMITTED", "COMPLETED"), false);
    assert.equal(isValidFulfillmentTransition("COMPLETED", "IN_PROGRESS"), false);
    assert.equal(isValidFulfillmentTransition("CANCELLED", "APPROVED"), false);
  });

  it("requires a paid order and the matching publisher or advertiser owner", () => {
    const publisherFilter = buildFulfillmentActionFilter("IN_PROGRESS", "PUBLISHER", "publisher-1");
    assert.equal(publisherFilter?.paymentStatus, "PAID");
    assert.deepEqual(publisherFilter?.status, { in: ["CONFIRMED"] });
    assert.deepEqual(publisherFilter?.website, {
      is: { publisherProfile: { is: { userId: "publisher-1" } } },
    });

    const advertiserFilter = buildFulfillmentActionFilter("APPROVED", "ADVERTISER", "advertiser-1");
    assert.equal(advertiserFilter?.paymentStatus, "PAID");
    assert.deepEqual(advertiserFilter?.status, { in: ["CONTENT_SUBMITTED"] });
    assert.equal(advertiserFilter?.advertiserId, "advertiser-1");
  });

  it("requires a submitted live URL before allowing completion", () => {
    const filter = buildFulfillmentActionFilter("COMPLETED", "ADVERTISER", "advertiser-1", true);
    assert.deepEqual(filter?.status, { in: ["PUBLISHED"] });
    assert.deepEqual(filter?.publicationUrl, { not: null });
    assert.equal(buildFulfillmentActionFilter("CANCELLED", "ADVERTISER", "advertiser-1"), null);
  });
});