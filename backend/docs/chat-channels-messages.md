# Chat, Channels, and Messages

This document covers the current chat feature implementation in the backend, including channel creation, member management, message APIs, and the response shapes used by the endpoints.

## Feature structure

The backend chat feature is split into small modules:

- `src/features/chat/channels/` — channel creation, listing, details, update, delete, and member management
- `src/features/chat/messages/` — message listing and creation
- `src/features/chat/channel-permissions.js` — shared access-control helpers
- `src/features/chat/chat.routes.js` — feature router that mounts the channel and message routers

## Base route

All endpoints are mounted under:

`/api/v1/chat`

## Authentication and authorization

All chat endpoints require authentication.

Channel management endpoints also use RBAC:

- `admin` and `hr` can manage channels and members
- `pm` can manage channels for projects they manage
- project/member access checks are enforced for project-scoped channels and members

## Response format

Successful responses use the shared format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors use the same shared API error format used throughout the backend.

## Channel behavior

Channels support both global and project-scoped usage.

- If `project_id` is omitted, the channel is global
- If `project_id` is provided, the channel belongs to that project
- `is_private` can be used to mark the channel as private
- `member_user_ids` can be passed when creating a channel to seed members immediately

### Important membership behavior

Membership is not limited to private channels anymore.

If the caller has channel management permission, they can add or remove members from any channel.

Channel membership rules are:

- creator is always added at creation time
- `member_user_ids` is accepted on create and bulk-adds members
- duplicate users are ignored safely by the database insert
- project-scoped channel members are validated against the project team when required

## Channels API

### `GET /channels`

Returns channels visible to the current user.

Query parameters:

- `projectId` optional — filters channels by project

Notes:

- `members` is returned as a short preview, not the full membership list
- `currentUserIsMember` is included for each channel

Example response:

```json
{
  "success": true,
  "data": [
    {
      "id": "channel-uuid",
      "name": "project-chat",
      "projectId": "project-uuid",
      "isPrivate": true,
      "members": [
        {
          "userId": 4,
          "user": {
            "id": 4,
            "email": "user@example.com",
            "role": "employee"
          }
        }
      ],
      "currentUserIsMember": true
    }
  ]
}
```

### `GET /projects/:projectId/channels`

Returns channels for a specific project.

Requires access to the project.

### `GET /channels/:channelId`

Returns one channel with full membership details.

This endpoint now includes the complete `members` list with nested `user` data.

### `POST /channels`

Creates a channel.

Required body:

```json
{
  "name": "project-five",
  "project_id": "project-uuid",
  "is_private": true,
  "member_user_ids": [4, 5]
}
```

Accepted keys:

- `project_id` or `projectId`
- `is_private` or `isPrivate`
- `member_user_ids` or `memberUserIds`

Behavior:

- the creator is added automatically
- passed member IDs are added immediately
- duplicate IDs are skipped
- project-scoped member IDs are validated before insert

Example success response:

```json
{
  "success": true,
  "message": "Channel created",
  "data": {
    "id": "channel-uuid",
    "name": "project-five",
    "projectId": "project-uuid",
    "isPrivate": true,
    "members": [
      {
        "channelId": "channel-uuid",
        "userId": 4,
        "user": {
          "id": 4,
          "email": "user@example.com",
          "role": "employee"
        }
      }
    ],
    "currentUserIsMember": true
  }
}
```

### `PATCH /channels/:channelId`

Updates channel details.

Allowed fields:

- `name`
- `description`
- `is_private` / `isPrivate`

The update response now includes full `members` with nested `user` data.

### `DELETE /channels/:channelId`

Deletes a channel.

Requires channel management permission.

## Channel member APIs

### `GET /channels/:channelId/members`

Returns the full member list for the channel.

This is the endpoint to use when you need the complete membership list.

### `POST /channels/:channelId/members`

Adds members to a channel.

This endpoint now supports both single and bulk input.

Accepted request bodies:

Single member:

```json
{
  "user_id": 4
}
```

Bulk members:

```json
{
  "user_ids": [4, 5, 6]
}
```

Behavior:

- manager/admin/hr permission is required
- duplicate memberships are skipped
- returned rows include nested `user` data

### `DELETE /channels/:channelId/members/:userId`

Removes a member from a channel.

Behavior:

- manager/admin/hr permission is required
- the channel creator cannot be removed

## Messages API

### `GET /channels/:channelId/messages`

Returns channel messages.

Query parameters:

- `before` optional ISO datetime cursor
- `limit` optional integer, capped at 100

### `POST /messages`

Creates a message in a channel.

Required body:

```json
{
  "channel_id": "channel-uuid",
  "content": "Hello team"
}
```

Optional body:

```json
{
  "parent_id": "message-uuid"
}
```

Accepted keys:

- `channel_id` or `channelId`
- `content` or `message`
- `parent_id` or `parentId`

## Practical usage patterns

### Create a project channel and seed members

1. Call `POST /api/v1/chat/channels`
2. Pass `project_id`
3. Pass `member_user_ids` with the users to add immediately
4. Use `is_private: true` if you want a private project channel

### Add more members later

Call `POST /api/v1/chat/channels/:channelId/members` with either `user_id` or `user_ids`.

### Fetch a channel with all members

Call `GET /api/v1/chat/channels/:channelId`

### Fetch a list of channels quickly

Call `GET /api/v1/chat/channels`

This returns a small membership preview for each channel, not the full member list.

## Notes on project team sync

Private project channels are still synced when project team members are added or removed.

That means if a user is added to the project team, the backend can also add them to matching private project channels automatically.

## Related files

- `src/features/chat/channels/channels.routes.js`
- `src/features/chat/channels/channels.controller.js`
- `src/features/chat/channels/channels.service.js`
- `src/features/chat/messages/messages.routes.js`
- `src/features/chat/messages/messages.controller.js`
- `src/features/chat/messages/messages.service.js`
- `src/features/chat/channel-permissions.js`
