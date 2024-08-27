import { UpdateUserRoleDto, User } from "@/types/types";
import apiSlice from "../../api/apiSlice";

const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/user/${id}`,
        method: "DELETE",
      }),
    }),
    updateUserRole: builder.mutation<void, UpdateUserRoleDto>({
      query: ({ id, role }) => ({
        url: `/admin/user/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} = usersApiSlice;

export default usersApiSlice;
