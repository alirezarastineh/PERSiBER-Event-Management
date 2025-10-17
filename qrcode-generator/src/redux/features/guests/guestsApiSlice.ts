import { CreateGuestDto, Guest, GuestStatistics, UpdateGuestDto } from "@/types/guests";
import { apiSlice } from "./../../api/apiSlice";

const guestsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllGuests: builder.query<{ guests: Guest[]; statistics: GuestStatistics }, void>({
      query: () => ({
        url: "/guests",
        method: "GET",
      }),
      providesTags: ["Guest"],
    }),
    getGuestByName: builder.query<Guest, string>({
      query: (name) => ({
        url: `/guests/by-name/${name}`,
        method: "GET",
      }),
      providesTags: (result, error, name) =>
        result && !error ? [{ type: "Guest" as const, id: name }] : [],
    }),
    getGuestById: builder.query<Guest, string>({
      query: (id) => ({
        url: `/guests/by-id/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) =>
        result && !error ? [{ type: "Guest" as const, id }] : [],
    }),
    createGuest: builder.mutation<Guest, CreateGuestDto>({
      query: (newGuest) => ({
        url: "/guests/add",
        method: "POST",
        body: newGuest,
      }),
      invalidatesTags: ["Guest"],
    }),
    updateGuest: builder.mutation<Guest, { id: string; data: UpdateGuestDto }>({
      query: ({ id, data }) => ({
        url: `/guests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    updateAttendedStatus: builder.mutation<Guest, { id: string; attended: string }>({
      query: ({ id, attended }) => ({
        url: `/guests/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    updateStudentStatus: builder.mutation<
      Guest,
      { id: string; isStudent: boolean; untilWhen: Date | null }
    >({
      query: ({ id, isStudent, untilWhen }) => ({
        url: `/guests/${id}/student`,
        method: "PATCH",
        body: { isStudent, untilWhen },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    updateLadyStatus: builder.mutation<Guest, { id: string; isLady: boolean }>({
      query: ({ id, isLady }) => ({
        url: `/guests/${id}/lady`,
        method: "PATCH",
        body: { isLady },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    adjustDrinksCoupon: builder.mutation<Guest, { id: string; adjustment: number }>({
      query: ({ id, adjustment }) => ({
        url: `/guests/${id}/drinks-coupon`,
        method: "PATCH",
        body: { adjustment },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    toggleStudentDiscount: builder.mutation<void, boolean>({
      query: (active) => ({
        url: `/guests/discounts/toggle-student`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: ["Guest"],
    }),
    toggleLadyDiscount: builder.mutation<void, boolean>({
      query: (active) => ({
        url: `/guests/discounts/toggle-lady`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: ["Guest"],
    }),
    deleteGuest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/guests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) =>
        result !== undefined && !error ? [{ type: "Guest" as const, id }, "Guest"] : [],
    }),
    findOrCreateGuest: builder.mutation<Guest, string>({
      query: (name) => ({
        url: `/guests/find-or-create`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Guest"],
    }),
  }),
});

export const {
  useGetAllGuestsQuery,
  useGetGuestByNameQuery,
  useGetGuestByIdQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  useUpdateAttendedStatusMutation,
  useUpdateStudentStatusMutation,
  useUpdateLadyStatusMutation,
  useAdjustDrinksCouponMutation,
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useDeleteGuestMutation,
  useFindOrCreateGuestMutation,
} = guestsApiSlice;

export default guestsApiSlice;
