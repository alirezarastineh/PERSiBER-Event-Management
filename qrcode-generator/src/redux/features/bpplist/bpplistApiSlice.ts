import apiSlice from "@/redux/api/apiSlice";
import { Bpplist, BpplistStatistics, CreateBpplistDto, UpdateBpplistDto } from "@/types/bpplist";

const bpplistApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllBpplist: builder.query<{ bpplist: Bpplist[]; statistics: BpplistStatistics }, void>({
      query: () => ({
        url: "/bpplist",
        method: "GET",
      }),
      providesTags: ["Bpplist"],
    }),
    createBpplistItem: builder.mutation<Bpplist, CreateBpplistDto>({
      query: (newBpplistItem) => ({
        url: "/bpplist/add",
        method: "POST",
        body: newBpplistItem,
      }),
      invalidatesTags: ["Bpplist"],
    }),
    updateBpplistItem: builder.mutation<Bpplist, { id: string; data: UpdateBpplistDto }>({
      query: ({ id, data }) => ({
        url: `/bpplist/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Bpplist" as const, id }, "Bpplist"] : [],
    }),
    updateAttendedStatus: builder.mutation<Bpplist, { id: string; attended: string }>({
      query: ({ id, attended }) => ({
        url: `/bpplist/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Bpplist" as const, id }, "Bpplist"] : [],
    }),
    updateHasLeftStatus: builder.mutation<Bpplist, { id: string; hasLeft: boolean }>({
      query: ({ id, hasLeft }) => ({
        url: `/bpplist/${id}/hasLeft`,
        method: "PATCH",
        body: { hasLeft },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Bpplist" as const, id }, "Bpplist"] : [],
    }),
    updateStudentStatus: builder.mutation<
      Bpplist,
      { id: string; isStudent: boolean; untilWhen: Date | null }
    >({
      query: ({ id, isStudent, untilWhen }) => ({
        url: `/bpplist/${id}/student`,
        method: "PATCH",
        body: { isStudent, untilWhen },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Bpplist" as const, id }, "Bpplist"] : [],
    }),
    deleteBpplistItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bpplist/${id}`,
        method: "DELETE",
      }),
      // Optimistic update: remove item from cache immediately
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          bpplistApiSlice.util.updateQueryData("getAllBpplist", undefined, (draft) => {
            const index = draft.bpplist.findIndex((item) => item._id === id);
            if (index !== -1) {
              draft.bpplist.splice(index, 1);
              draft.statistics.totalCount -= 1;
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, id) =>
        result !== undefined && !error ? [{ type: "Bpplist" as const, id }] : [],
    }),
  }),
});

export const {
  useGetAllBpplistQuery,
  useCreateBpplistItemMutation,
  useUpdateBpplistItemMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteBpplistItemMutation,
} = bpplistApiSlice;

export default bpplistApiSlice;
