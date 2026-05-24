export const adminChannels = [
  {
    slug: "general",
    name: "# general",
    members: 24,
    description: "Daily coordination and team-wide updates.",
    messages: [
      { author: "Aisha Khan", time: "10:12 AM", tone: "highlight", text: "Please keep project updates in this channel so everyone stays aligned." },
      { author: "Muhammad Waqar", time: "10:18 AM", tone: "neutral", text: "The admin flow is now split into sidebar selection and main conversation view." },
      { author: "Slackbot", time: "10:21 AM", tone: "muted", text: "Reminder: follow up on the pending project approvals today." },
    ],
  },
  {
    slug: "announcements",
    name: "# announcements",
    members: 31,
    description: "Broadcasts and company-wide notices.",
    messages: [
      { author: "Admin Team", time: "9:05 AM", tone: "highlight", text: "The office will be closed next Friday for maintenance." },
      { author: "HR Ops", time: "9:20 AM", tone: "neutral", text: "Please review the updated onboarding checklist before end of day." },
    ],
  },
  {
    slug: "admin-updates",
    name: "# admin-updates",
    members: 8,
    description: "Internal operations and workflow tracking.",
    messages: [
      { author: "Bilal Ahmed", time: "8:45 AM", tone: "neutral", text: "Payroll approvals are ready for review." },
      { author: "Aisha Khan", time: "8:52 AM", tone: "muted", text: "Department changes have been synced to the admin dashboard." },
    ],
  },
]

export const adminDirectMessages = [
  {
    slug: "aisha-khan",
    name: "Aisha Khan",
    role: "Operations",
    description: "Private conversation with the operations lead.",
    messages: [
      { author: "Aisha Khan", time: "11:02 AM", tone: "highlight", text: "Please review the latest project notes and confirm the handoff." },
      { author: "You", time: "11:05 AM", tone: "neutral", text: "I’ve checked the notes and will update the summary section shortly." },
    ],
  },
  {
    slug: "bilal-ahmed",
    name: "Bilal Ahmed",
    role: "Project Manager",
    description: "Private conversation with the project lead.",
    messages: [
      { author: "Bilal Ahmed", time: "10:25 AM", tone: "neutral", text: "Client approval is still pending for the design draft." },
      { author: "You", time: "10:31 AM", tone: "muted", text: "I’ll flag it in the admin notes and follow up today." },
    ],
  },
  {
    slug: "sara-malik",
    name: "Sara Malik",
    role: "HR",
    description: "Private conversation with HR.",
    messages: [
      { author: "Sara Malik", time: "9:14 AM", tone: "highlight", text: "The onboarding checklist has been updated for the new hires." },
      { author: "You", time: "9:18 AM", tone: "neutral", text: "Great, I’ll sync that into the admin communication board." },
    ],
  },
]

export function getAdminChannel(slug) {
  return adminChannels.find((channel) => channel.slug === slug)
}

export function getAdminDirectMessage(slug) {
  return adminDirectMessages.find((message) => message.slug === slug)
}
