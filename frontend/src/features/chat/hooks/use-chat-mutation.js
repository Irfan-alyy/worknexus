import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { chatApi } from "../services/chat-api"

export const useCreateChatChannelMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: chatApi.createChannel,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useFindOrCreateDMMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: ({ receiverId }) => chatApi.findOrCreateDM(receiverId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

// ============================================================================
// MESSAGE MUTATIONS
// ============================================================================

export const useCreateMessageMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: chatApi.createMessage,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useUpdateMessageMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: ({ messageId, payload }) => chatApi.updateMessage(messageId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useDeleteMessageMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: chatApi.deleteMessage,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useAddReactionMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: chatApi.addReaction,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useRemoveReactionMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: ({ messageId, emoji }) => chatApi.removeReaction(messageId, emoji),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

// ============================================================================
// CHANNEL MUTATIONS
// ============================================================================

export const useUpdateChannelMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: ({ channelId, payload }) => chatApi.updateChannel(channelId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useDeleteChannelMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: chatApi.deleteChannel,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.channels() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useAddChannelMembersMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: (payload) => chatApi.addChannelMembers(channelId, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.channelMembers(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useRemoveChannelMemberMutation = (channelId, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: (userId) => chatApi.removeChannelMember(channelId, userId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.channelMembers(channelId),
      })
      onSuccess?.(...args)
    },
    ...rest,
  })
}
