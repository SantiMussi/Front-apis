export const normalizeUserRecord = (user, index) => {
  if (Array.isArray(user)) {
    const [email, _unused, firstName, lastName, user_id, role] = user;

    return {
      email: email || "",
      id: user_id,
      first_name: firstName || "",
      last_name: lastName || "",
      role: role ?? "",
    };
  }

  return {
    id: user?.id ?? index,
    email: user?.email ?? "",
    first_name: user?.first_name ?? user?.firstName ?? user?.firstname ?? "",
    last_name: user?.last_name ?? user?.lastName ?? user?.lastname ?? "",
    role: user?.role ?? "",
  };
};