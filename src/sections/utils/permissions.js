export const AVAILABLE_ACTIONS = ["view", "add", "edit", "delete"];

export const normalizeRole = (role = "") =>
  String(role).toLowerCase().replace(/[_\s]/g, "-");

export const getUserRole = () =>
  normalizeRole(
    sessionStorage.getItem("userRole") ||
      localStorage.getItem("userRole") ||
      "",
  );

export const getUserPermissions = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem("permissions") ||
        localStorage.getItem("permissions") ||
        "[]",
    );
  } catch {
    return [];
  }
};

// Check route access
export const hasRouteAccess = (route) => {
  const role = getUserRole();

  // Super Admin can access all routes
  if (role === "super-admin") {
    return true;
  }

  // Admin and Sub Admin can access only assigned routes
  if (role === "admin" || role === "sub-admin") {
    const normalizedRoute = route.replace(/\/+$/, "").toLowerCase();

    return getUserPermissions().some((permission) => {
      const permittedRoute = permission.route
        ?.replace(/\/+$/, "")
        .toLowerCase();

      return (
        permittedRoute &&
        (normalizedRoute === permittedRoute ||
          normalizedRoute.startsWith(`${permittedRoute}/`))
      );
    });
  }

  return false;
};

// Check action access

export const hasActionAccess = (route, action) => {
  const role = getUserRole();

  // Super Admin can perform all actions
  if (role === "super-admin") {
    return true;
  }

  const normalizedRoute = route.replace(/\/+$/, "").toLowerCase();
  const normalizedAction = String(action).toLowerCase();

  // Find permissions for the requested route
  const permission = getUserPermissions().find((item) => {
    const permittedRoute = item.route
      ?.replace(/\/+$/, "")
      .toLowerCase();

    return (
      permittedRoute &&
      (normalizedRoute === permittedRoute ||
        normalizedRoute.startsWith(`${permittedRoute}/`))
    );
  });

  // No permission for this route
  if (!permission) {
    return false;
  }

  // Admin can perform all actions on assigned routes
  if (role === "admin") {
    return true;
  }

  // Sub Admin can perform only backend-assigned actions
  if (role === "sub-admin") {
    const allowedActions = (permission.actions || []).map((item) =>
      String(item).toLowerCase()
    );

    return allowedActions.includes(normalizedAction);
  }

  return false;
};

