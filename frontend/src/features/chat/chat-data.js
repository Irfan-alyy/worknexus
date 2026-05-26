export const chatChannels = [
  { id: "general", name: "general", unread: 2, topic: "Company-wide updates" },
  { id: "announcements", name: "announcements", unread: 0, topic: "Important notices" },
  { id: "product-dev", name: "product-dev", unread: 5, topic: "Product and engineering" },
  { id: "random", name: "random", unread: 1, topic: "Watercooler chat" },
]

export const directMessages = [
  { id: "aisha-khan", name: "Aisha Khan", status: "online" },
  { id: "muhammad-waqar", name: "Muhammad Waqar", status: "away" },
  { id: "slackbot", name: "Slackbot", status: "bot" },
]

export function findChannelById(channelId) {
  return chatChannels.find((channel) => channel.id === channelId) ?? chatChannels[0]
}

export function findDirectMessageById(dmId) {
  return directMessages.find((dm) => dm.id === dmId) ?? directMessages[0]
}
