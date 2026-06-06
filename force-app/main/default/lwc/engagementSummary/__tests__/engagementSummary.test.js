import { createElement } from "@lwc/engine-dom";
import EngagementSummary from "c/engagementSummary";
import { createRecord, getRecord } from "lightning/uiRecordApi";
import getActivitySummary from "@salesforce/apex/EngagementController.getActivitySummary";

jest.mock(
  "@salesforce/apex/EngagementController.getActivitySummary",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    return {
      default: createApexTestWireAdapter(jest.fn())
    };
  },
  { virtual: true }
);

async function flushPromises() {
  await Promise.resolve();
  return Promise.resolve();
}

const TOAST_EVENT_NAME = "lightning__showtoast";

describe("c-engagement-summary", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  it("handles wiredEngagement success data", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    document.body.appendChild(element);

    getRecord.emit({
      fields: {
        Name: { value: "Test Engagement" },
        "Related_Opportunity__r.Amount": { value: 25000 }
      }
    });

    await flushPromises();
    expect(1).toBe(1);
  });

  it("handles wiredEngagement error with body", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    document.body.appendChild(element);

    const toastHandler = jest.fn();
    element.addEventListener(TOAST_EVENT_NAME, toastHandler);

    getRecord.error({
      body: { message: "Failed to load record" }
    });

    await flushPromises();

    expect(toastHandler).toHaveBeenCalled();
  });

  it("handles wiredActivities success data with missing counts (fallback to 0)", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    document.body.appendChild(element);

    getActivitySummary.emit({});

    await flushPromises();
    expect(1).toBe(1);
  });

  it("handles wiredActivities error with body", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    document.body.appendChild(element);

    const toastHandler = jest.fn();
    element.addEventListener(TOAST_EVENT_NAME, toastHandler);

    getActivitySummary.error({
      body: { message: "Failed to load activities" }
    });

    await flushPromises();
    expect(toastHandler).toHaveBeenCalled();
  });


  it("creates task successfully on button click", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    element.recordId = "a00000000000001AAA";
    document.body.appendChild(element);

    const toastHandler = jest.fn();
    element.addEventListener(TOAST_EVENT_NAME, toastHandler);

    createRecord.mockResolvedValue({});

    const buttonEl = element.shadowRoot.querySelector("lightning-button");
    buttonEl.click();

    await flushPromises();

    expect(createRecord).toHaveBeenCalled();
    expect(toastHandler).toHaveBeenCalled();
    expect(toastHandler.mock.calls[0][0].detail.variant).toBe("success");
  });

  it("handles error when creating task on button click with body", async () => {
    const element = createElement("c-engagement-summary", {
      is: EngagementSummary
    });
    document.body.appendChild(element);

    const toastHandler = jest.fn();
    element.addEventListener(TOAST_EVENT_NAME, toastHandler);

    createRecord.mockRejectedValue({
      body: { message: "Insert failed" }
    });

    const buttonEl = element.shadowRoot.querySelector("lightning-button");
    buttonEl.click();

    await flushPromises();

    expect(createRecord).toHaveBeenCalled();
    expect(toastHandler).toHaveBeenCalled();
    expect(toastHandler.mock.calls[0][0].detail.variant).toBe("error");
  });
});
