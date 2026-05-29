import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { payrollApi } from "../services/payroll-api"

export const useUpdatePayrollStatusMutation = (options = {}) => {
	const queryClient = useQueryClient()
	const { onSuccess, ...rest } = options

	return useMutation({
		mutationFn: ({ payrollId, paymentStatus }) => payrollApi.updatePayrollStatus(payrollId, paymentStatus),
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all })
			onSuccess?.(...args)
		},
		...rest,
	})
}