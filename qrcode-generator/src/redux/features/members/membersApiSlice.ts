import apiSlice from "@/redux/api/apiSlice";
import {
  CreateMemberDto,
  Member,
  MemberStatistics,
  UpdateMemberDto,
} from "@/types/types";

const membersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMembers: builder.query<
      { members: Member[]; statistics: MemberStatistics },
      void
    >({
      query: () => ({
        url: "/members",
        method: "GET",
      }),
    }),
    createMember: builder.mutation<Member, CreateMemberDto>({
      query: (newMember) => ({
        url: "/members",
        method: "POST",
        body: newMember,
      }),
    }),
    updateMember: builder.mutation<
      Member,
      { id: string; data: UpdateMemberDto }
    >({
      query: ({ id, data }) => ({
        url: `/members/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    updateAttendedStatus: builder.mutation<
      Member,
      { id: string; attended: string }
    >({
      query: ({ id, attended }) => ({
        url: `/members/${id}/attended`,
        method: "PATCH",
        body: { attended },
      }),
    }),
    updateHasLeftStatus: builder.mutation<
      Member,
      { id: string; hasLeft: boolean }
    >({
      query: ({ id, hasLeft }) => ({
        url: `/members/${id}/hasLeft`,
        method: "PATCH",
        body: { hasLeft },
      }),
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
    }),
    deleteMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
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
