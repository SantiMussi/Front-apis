import { store } from "../redux/store";

// helpers internos
export function GetToken() {
  return store.getState().auth.token;
}

export function GetRole() {
  return store.getState().auth.role;
}

export function IsLoggedIn() {
  return !!GetToken();
}

export function hasRole(...requiredRoles) {
  const role = GetRole();
  return !!role && requiredRoles.includes(role);
}
