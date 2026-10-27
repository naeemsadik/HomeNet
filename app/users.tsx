import { Redirect } from "expo-router";

/** `/users` is a legacy alias — canonical user management route is `/admin/users`. */
export default function UsersRoute() {
  return <Redirect href="/admin/users" />;
}
