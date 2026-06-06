public with sharing class EngagementController {
    public class ActivitySummary {
        @AuraEnabled public Integer completedTasks;
        @AuraEnabled public Integer upcomingEvents;

        public ActivitySummary(Integer completedTasks, Integer upcomingEvents) {
            this.completedTasks = completedTasks;
            this.upcomingEvents = upcomingEvents;
        }
    }

    @AuraEnabled(cacheable=true)
    public static ActivitySummary getActivitySummary(Id engagementId) {
        
        if (String.isBlank(engagementId)) {
            return new ActivitySummary(0, 0);
        }

        Integer completedTasksCount = [
            SELECT COUNT()
            FROM Task
            WHERE WhatId = :engagementId
            AND IsClosed = true
            WITH USER_MODE
        ];

        Integer upcomingEventsCount = [
            SELECT COUNT()
            FROM Event
            WHERE WhatId = :engagementId
            AND StartDateTime >= :Datetime.now()
            WITH USER_MODE
        ];

        return new ActivitySummary(completedTasksCount, upcomingEventsCount);
    }
}