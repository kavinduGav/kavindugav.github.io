---
title: "Warehouse Management System"
description: "SAP integration, delivery scheduling, dashboards"
summary: "A back-office and operator platform that syncs invoices from SAP, schedules deliveries automatically and gives admins a live view of the warehouse floor."
tag: "Next.js"
category: "Web"
order: 1
homeMedia: "video demo: operator flow (data blurred)"
role: "Backend & mobile engineer"
company: "OREL Group"
timeline: "2025"
platforms: "Web back-office · Operator app"
problem: "Invoices lived in SAP while delivery planning happened by hand, so operators re-keyed data and admins had no live picture of what was moving."
approach: "Node.js services sync invoices from SAP into PostgreSQL, a scheduler assigns deliveries, and separate React and Next.js front-ends serve admins and operators."
outcome: "One source of truth from invoice to dispatch, with dashboards admins use to monitor the floor in real time."
tech:
  - "Node.js"
  - "PostgreSQL"
  - "React"
  - "Next.js"
  - "Flutter"
  - "SAP integration"
heroCaption: "video demo: invoice sync to delivery schedule (customer data blurred)"
screenshots:
  - media: "screenshot: admin dashboard (random data)"
    caption: "Admin monitoring dashboard"
  - media: "screenshot: delivery scheduler (blurred)"
    caption: "Automated delivery scheduling"
  - media: "architecture diagram: SAP to sync service to Postgres to back-office/operator apps"
    caption: "System architecture"
    wide: true
---
