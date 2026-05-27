import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { chatApi } from "../services/chat-api"

export const useChatChannelsQuery = (params = {}, options = {}) =>
	useQuery({
		queryKey: queryKeys.chat.channels(params),
		queryFn: () => chatApi.listChannels(params),
		...options,
	})
