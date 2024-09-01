import {
  CreateGuestDto,
  Guest,
  GuestStatistics,
  UpdateGuestDto,
} from "@/types/types";
import { apiSlice } from "./../../api/apiSlice";

const guestsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllGuests: builder.query<
      { guests: Guest[]; statistics: GuestStatistics },
      void
    >({
      query: () => ({
        url: "/guests",
        method: "GET",
      }),
    }),
    getGuestByName: builder.query<Guest, string>({
      query: (name) => ({
        url: `/guests/${name}`,
        method: "GET",
      }),
    }),
    getGuestById: builder.query<Guest, string>({
      query: (id) => ({
        url: `/guests/${id}`,
        method: "GET",
      }),
    }),
    createGuest: builder.mutation<Guest, CreateGuestDto>({
      query: (newGuest) => ({
        url: "/guests/add",
        method: "POST",
        body: newGuest,
      }),
    }),
    updateGuest: builder.mutation<Guest, { id: string; data: UpdateGuestDto }>({
      query: ({ id, data }) => ({
        url: `/guests/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    updateAttendedStatus: builder.mutation<
      Guest,
      { id: string; attended: string }
    >({
      query: ({ id, attended }) => ({
        url: `/guests/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
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
    }),
    updateLadyStatus: builder.mutation<Guest, { id: string; isLady: boolean }>({
      query: ({ id, isLady }) => ({
        url: `/guests/${id}/lady`,
        method: "PATCH",
        body: { isLady },
      }),
    }),
    toggleStudentDiscount: builder.mutation<void, boolean>({
      query: (active) => ({
        url: `/guests/discounts/toggle-student`,
        method: "PATCH",
        body: { active },
      }),
    }),
    toggleLadyDiscount: builder.mutation<void, boolean>({
      query: (active) => ({
        url: `/guests/discounts/toggle-lady`,
        method: "PATCH",
        body: { active },
      }),
    }),
    deleteGuest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/guests/${id}`,
        method: "DELETE",
      }),
    }),
    findOrCreateGuest: builder.mutation<Guest, string>({
      query: (name) => ({
        url: `/guests/find-or-create`,
        method: "POST",
        body: { name },
      }),
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
  useToggleStudentDiscountMutation,
  useToggleLadyDiscountMutation,
  useDeleteGuestMutation,
  useFindOrCreateGuestMutation,
} = guestsApiSlice;

export default guestsApiSlice;
