import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getActivitySummary from "@salesforce/apex/EngagementController.getActivitySummary";

import NAME_FIELD from "@salesforce/schema/Engagement__c.Name";
import OPP_AMOUNT_FIELD from "@salesforce/schema/Engagement__c.Related_Opportunity__r.Amount";

const FIELDS = [NAME_FIELD, OPP_AMOUNT_FIELD];

export default class EngagementSummary extends LightningElement {
  @api recordId;

  engagementName = "";
  opportunityAmount = 0;
  completedTasks = 0;
  upcomingEvents = 0;
  isCreating = false;

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredEngagement({ error, data }) {
    if (data) {
      this.engagementName = getFieldValue(data, NAME_FIELD);
      this.opportunityAmount = getFieldValue(data, OPP_AMOUNT_FIELD) || 0;
    } else if (error) {
      this.showToast("Error loading Engagement", error.body?.message, "error");
    }
  }

  @wire(getActivitySummary, { engagementId: "$recordId" })
  wiredActivities({ error, data }) {
    if (data) {
      this.completedTasks = data.completedTasks || 0;
      this.upcomingEvents = data.upcomingEvents || 0;
    } else if (error) {
      this.showToast("Error loading activities", error.body?.message, "error");
    }
  }

  handleCreateTask() {
    this.isCreating = true;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fields = {
      Subject: `Follow-up on ${this.engagementName}`,
      ActivityDate: tomorrow.toISOString().split("T")[0],
      WhatId: this.recordId,
      TaskSubtype: "Call"
    };

    const recordInput = { apiName: "Task", fields };

    createRecord(recordInput)
      .then(() => {
        this.showToast(
          "Success",
          "Quick Follow-Up Call scheduled for tomorrow.",
          "success"
        );
      })
      .catch((error) => {
        this.showToast("Error creating Task", error.body?.message, "error");
      })
      .finally(() => {
        this.isCreating = false;
      });
  }

  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
