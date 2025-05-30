import apiSlice from "@/redux/api/apiSlice";
import {
  Bpplist,
  BpplistStatistics,
  CreateBpplistDto,
  UpdateBpplistDto,
} from "@/types/types";

const bpplistApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllBpplist: builder.query<
      { bpplist: Bpplist[]; statistics: BpplistStatistics },
      void
    >({
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
    updateBpplistItem: builder.mutation<
      Bpplist,
      { id: string; data: UpdateBpplistDto }
    >({
      query: ({ id, data }) => ({
        url: `/bpplist/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bpplist" as const, id },
        "Bpplist",
      ],
    }),
    updateAttendedStatus: builder.mutation<
      Bpplist,
      { id: string; attended: string }
    >({
      query: ({ id, attended }) => ({
        url: `/bpplist/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bpplist" as const, id },
        "Bpplist",
      ],
    }),
    updateHasLeftStatus: builder.mutation<
      Bpplist,
      { id: string; hasLeft: boolean }
    >({
      query: ({ id, hasLeft }) => ({
        url: `/bpplist/${id}/hasLeft`,
        method: "PATCH",
        body: { hasLeft },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bpplist" as const, id },
        "Bpplist",
      ],
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
      invalidatesTags: (result, error, { id }) => [
        { type: "Bpplist" as const, id },
        "Bpplist",
      ],
    }),
    deleteBpplistItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bpplist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Bpplist" as const, id },
        "Bpplist",
      ],
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
