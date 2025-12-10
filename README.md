# chaihub-server
Server API's for ChaiHub Application

Group
    - 4 People
    - 1 Leader
    - Create a Cohort, Selective Signups by Upload CSV (name, email, cohorts)
    - Students can view all cohorts
    - Group Leader cannot join other groups
    - User can view multiple groups
    - User can stay in only one group at a time
    - User can apply to join a group only once at a time
    - User can withdraw from group after 24hrs
    - Every activity is logged in cohort, group, user activityLogs

user {
    id
    createdAt
    updatedAt
    fullname String
    email String
    skills [{skillName, [technologyNames]}]
    socialLinks [{platform, url}]
    auditLogs [auditLog_ids]
}

group {
    id
    createdAt
    updatedAt
    name String
    description String
    skills [{name, required}]
    members [{user_id, role, joinedAt}]
    maxMembers Int
    announcement [{message, [{name, url}], createdAt}]
    createdBy user_id
    cohort cohort_id
    auditLogs [auditLog_ids]
}

cohort {
    id
    createdAt
    updatedAt
    name String
    description String
    createdBy user_id
    students [user_ids]
    groups [group_ids]
    auditLogs [auditLog_ids]
}

auditLog {
    id
    createdAt
    updatedAt
    activityName String
    activityBy user_id
    timestamp DateTime
}