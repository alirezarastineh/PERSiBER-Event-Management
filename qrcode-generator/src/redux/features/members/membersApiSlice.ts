import apiSlice from "@/redux/api/apiSlice";
import { CreateMemberDto, Member, MemberStatistics, UpdateMemberDto } from "@/types/members";

const membersApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllMembers: builder.query<{ members: Member[]; statistics: MemberStatistics }, void>({
      query: () => ({
        url: "/members",
        method: "GET",
      }),
      providesTags: ["Member"],
    }),
    createMember: builder.mutation<Member, CreateMemberDto>({
      query: (newMember) => ({
        url: "/members",
        method: "POST",
        body: newMember,
      }),
      invalidatesTags: ["Member"],
    }),
    updateMember: builder.mutation<Member, { id: string; data: UpdateMemberDto }>({
      query: ({ id, data }) => ({
        url: `/members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Member" as const, id }, "Member"] : [],
    }),
    updateAttendedStatus: builder.mutation<Member, { id: string; attended: string }>({
      query: ({ id, attended }) => ({
        url: `/members/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Member" as const, id }, "Member"] : [],
    }),
    updateHasLeftStatus: builder.mutation<Member, { id: string; hasLeft: boolean }>({
      query: ({ id, hasLeft }) => ({
        url: `/members/${id}/hasLeft`,
        method: "PATCH",
        body: { hasLeft },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Member" as const, id }, "Member"] : [],
    }),
    updateStudentStatus: builder.mutation<
      Member,
      { id: string; isStudent: boolean; untilWhen: Date | null }
    >({
      query: ({ id, isStudent, untilWhen }) => ({
        url: `/members/${id}/student`,
        method: "PATCH",
        body: { isStudent, untilWhen },
      }),
      invalidatesTags: (result, error, { id }) =>
        result && !error ? [{ type: "Member" as const, id }, "Member"] : [],
    }),
    deleteMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
      // Optimistic update: remove member from cache immediately
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          membersApiSlice.util.updateQueryData("getAllMembers", undefined, (draft) => {
            const index = draft.members.findIndex((member) => member._id === id);
            if (index !== -1) {
              draft.members.splice(index, 1);
              draft.statistics.totalCount -= 1;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, id) =>
        result !== undefined && !error ? [{ type: "Member" as const, id }] : [],
    }),
  }),
});

export const {
  useGetAllMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useUpdateAttendedStatusMutation,
  useUpdateHasLeftStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteMemberMutation,
} = membersApiSlice;

export default membersApiSlice;
