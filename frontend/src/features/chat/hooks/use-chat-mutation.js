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
