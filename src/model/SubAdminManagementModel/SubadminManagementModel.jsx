import React, { useMemo, useState } from "react";
import style from "./SubAdminManagementModel.module.css";
import { AVAILABLE_ACTIONS } from "../../sections/config/permissions";
import { getUserRole } from "../../sections/utils/permissions";
import { FaEdit } from "react-icons/fa";

const ACTIONS = AVAILABLE_ACTIONS.map((action) =>
  String(action).toLowerCase(),
).filter((action) => action !== "approve");
const getActionLabel = (action) =>
  action.charAt(0).toUpperCase() + action.slice(1);

const normalizeRoute = (route = "") =>
  String(route).trim().toLowerCase().replace(/\/+$/, "") || "/";

const normalizeActions = (actions = []) =>
  actions
    .map((action) => String(action).toLowerCase())
    .filter((action) => AVAILABLE_ACTIONS.includes(action));

const SubAdminManagementModel = ({
  onClose,
  onCreate,
  initialUser,
  permissionRoutes = [],
}) => {
  const loggedInRole = getUserRole();
  const isLoggedInAdmin = loggedInRole === "admin";
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [password, setPassword] = useState(initialUser?.password || "");
  const [role, setRole] = useState(initialUser?.role || "Sub Admin");
  const isSubAdmin =
    String(role).toLowerCase().replace(/[\s-]/g, "") === "subadmin";
   
const PAGE_ORDER = [
  ["dashboard"],
  ["course"],
  ["batch"],
  ["tasks", "task management"],
  ["students", "student management"],
  ["attendance"],
  ["academic"],
  ["fees", "fee management"],
  ["complaint", "complaints"],
  ["harassment"],
  ["enquiry"],
  ["student panel events"],
  ["website event images"],
  ["application"],
  ["placement", "placement management"],
  ["workshop"],
  ["student work"],
  ["alumni images"],
  ["subadmin management", "sub admin management"],
  ["settings"],
];

const normalizePageLabel = (label = "") =>
  String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getPageOrder = (page) => {
  const label = normalizePageLabel(page.label);

  const index = PAGE_ORDER.findIndex((aliases) =>
    aliases.some((alias) => normalizePageLabel(alias) === label),
  );

  return index === -1 ? PAGE_ORDER.length : index;
};

const availablePermissionRoutes = useMemo(() => {
  const routes = isSubAdmin
    ? permissionRoutes.filter(
        (page) =>
          !normalizePageLabel(page.label).includes("subadminmanagement"),
      )
    : permissionRoutes;

  return [...routes].sort((a, b) => getPageOrder(a) - getPageOrder(b));
}, [permissionRoutes, isSubAdmin]);

  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState(
    initialUser?.status?.toLowerCase() === "inactive" ? "inactive" : "active",
  );

  // Common actions used as defaults for newly selected routes.
  const [commonActions, setCommonActions] = useState(() => {
    const savedPermissions = initialUser?.permissions;

    if (Array.isArray(savedPermissions) && savedPermissions.length) {
      const savedActions = savedPermissions.flatMap((permission) =>
        normalizeActions(permission.actions || []),
      );

      return ACTIONS.filter(
        (action) => action === "view" || savedActions.includes(action),
      );
    }

    return [...ACTIONS];
  });

  // Individual actions for every selected route.
  
const [pagePermissions, setPagePermissions] = useState(() => {
  const savedPermissions = initialUser?.permissions;

  if (Array.isArray(savedPermissions)) {
    const updatedPermissions = {};

    savedPermissions.forEach((permission) => {
      const savedRoute = permission.route || permission.page;

      if (!savedRoute) return;

      // Match the API route with the actual route configured in the app.
      const matchingPage = permissionRoutes.find(
        (page) => normalizeRoute(page.path) === normalizeRoute(savedRoute),
      );

      // Keep the configured route as the key used by the UI.
      const route = matchingPage?.path || savedRoute;

      updatedPermissions[route] = normalizeActions(permission.actions || []);
    });

    return updatedPermissions;
  }

  const oldPermissions = initialUser?.pagePermissions || {};

  return Object.fromEntries(
    Object.entries(oldPermissions).map(([route, actions]) => {
      const matchingPage = permissionRoutes.find(
        (page) => normalizeRoute(page.path) === normalizeRoute(route),
      );

      return [matchingPage?.path || route, normalizeActions(actions || [])];
    }),
  );
});


  // Open accordions for routes that already have saved actions.
  // const [expandedRoutes, setExpandedRoutes] = useState(() => {
  //   const savedPermissions = initialUser?.permissions;

  //   if (Array.isArray(savedPermissions)) {
  //     return new Set(
  //       savedPermissions
  //         .filter(
  //           (permission) =>
  //             (permission.route || permission.page) &&
  //             Array.isArray(permission.actions) &&
  //             permission.actions.length > 0,
  //         )
  //         .map((permission) => permission.route || permission.page),
  //     );
  //   }

  //   return new Set();
  // });
  const [expandedRoutes, setExpandedRoutes] = useState(() => new Set());

  // Derived selected routes.
  const selectedPages = useMemo(
    () =>
      availablePermissionRoutes
        .map((page) => page.path)
        .filter((route) =>
          Object.prototype.hasOwnProperty.call(pagePermissions, route),
        ),
    [availablePermissionRoutes, pagePermissions],
  );

  // Search pages by their display names.
const filteredPages = useMemo(() => {
  const query = search.trim().toLowerCase();

  if (!query) return availablePermissionRoutes;

  return availablePermissionRoutes.filter((page) =>
    String(page.label || "")
      .toLowerCase()
      .includes(query),
  );
}, [availablePermissionRoutes, search]);

  const allCommonActionsSelected =
    ACTIONS.length > 0 && commonActions.length === ACTIONS.length;

  const allPagesSelected =
    availablePermissionRoutes.length > 0 &&
    availablePermissionRoutes.every((page) =>
      Object.prototype.hasOwnProperty.call(pagePermissions, page.path),
    );
  const clearError = (field) => {
    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  // Apply a common action to all currently selected routes.
  const toggleCommonAction = (action) => {
    if (action === "view") {
      return;
    }
    const isSelected = commonActions.includes(action);

    const updatedCommonActions = isSelected
      ? commonActions.filter((item) => item !== action)
      : [...commonActions, action];

    setCommonActions(updatedCommonActions);

    setPagePermissions((previous) => {
      const updated = { ...previous };

      selectedPages.forEach((route) => {
        const currentActions = previous[route] || [];

        updated[route] = isSelected
          ? currentActions.filter((item) => item !== action)
          : currentActions.includes(action)
            ? currentActions
            : [...currentActions, action];
      });

      return updated;
    });

    clearError("permissions");
  };

  // Select or deselect all common actions.
  const toggleAllCommonActions = () => {
    const nextActions = allCommonActionsSelected ? [] : [...ACTIONS];

    setCommonActions(nextActions);

    setPagePermissions((previous) => {
      const updated = { ...previous };

      selectedPages.forEach((route) => {
        const currentActions = previous[route] || [];

        updated[route] = allCommonActionsSelected
          ? []
          : ACTIONS.filter(
              (action) =>
                currentActions.includes(action) || nextActions.includes(action),
            );
      });

      return updated;
    });

    clearError("permissions");
  };

  // Selecting a route grants the current common actions by default.
 const togglePage = (route) => {
   const wasSelected = Object.prototype.hasOwnProperty.call(
     pagePermissions,
     route,
   );

   setPagePermissions((previous) => {
     const updated = { ...previous };

     if (wasSelected) {
       delete updated[route];
     } else {
       updated[route] = [...commonActions];
     }

     return updated;
   });

   // Do not change expandedRoutes here.
   clearError("permissions");
 };

  // Select or deselect all available routes.
  const toggleAllPages = () => {
    if (allPagesSelected) {
      setPagePermissions((previous) => {
        const updated = { ...previous };

        availablePermissionRoutes.forEach((page) => {
          delete updated[page.path];
        });

        return updated;
      });

      setExpandedRoutes((previous) => {
        const updated = new Set(previous);

        availablePermissionRoutes.forEach((page) => {
          updated.delete(page.path);
        });

        return updated;
      });
    } else {
      setPagePermissions((previous) => {
        const updated = { ...previous };

        availablePermissionRoutes.forEach((page) => {
          if (!Object.prototype.hasOwnProperty.call(updated, page.path)) {
            updated[page.path] = [...commonActions];
          }
        });

        return updated;
      });

      setExpandedRoutes(
        new Set(availablePermissionRoutes.map((page) => page.path)),
      );
    }

    clearError("permissions");
  };

  // Expand/collapse a route. Expanding an unselected route also
  // selects it and assigns the common actions.
  const toggleAccordion = (route) => {
    setExpandedRoutes((previous) => {
      const updated = new Set(previous);

      if (updated.has(route)) {
        updated.delete(route);
      } else {
        updated.add(route);
      }

      return updated;
    });
  };

  // Edit one action for one route only.
 const toggleAction = (route, action) => {
   if (!Object.prototype.hasOwnProperty.call(pagePermissions, route)) {
     return;
   }

   // Prevent unchecking View
   if (action === "view") {
     return;
   }

   setPagePermissions((previous) => {
     const currentActions = previous[route] || [];

     const updatedActions = currentActions.includes(action)
       ? currentActions.filter((item) => item !== action)
       : [...currentActions, action];

     return {
       ...previous,
       [route]: updatedActions,
     };
   });

   clearError("permissions");
 };

  // Select/deselect every action for an individual route.
  const toggleAllActions = (route) => {
    if (!Object.prototype.hasOwnProperty.call(pagePermissions, route)) {
      return;
    }

    const currentActions = pagePermissions[route] || [];

    const allSelected =
      ACTIONS.length > 0 &&
      ACTIONS.every((action) => currentActions.includes(action));

    setPagePermissions((previous) => ({
      ...previous,
      [route]: allSelected ? [] : [...ACTIONS],
    }));

    clearError("permissions");
  };

  // Restore the current common actions for an individual route.
  const resetPageActions = (route) => {
    setPagePermissions((previous) => ({
      ...previous,
      [route]: [...commonActions],
    }));

    clearError("permissions");
  };

  // Form validation.
  const validateForm = () => {
    const nextErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      nextErrors.name = "Name can contain only letters and spaces.";
    } else if (trimmedName.length < 3) {
      nextErrors.name = "Name must contain at least 3 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!trimmedEmail) {
      nextErrors.email = "E-mail is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid e-mail address.";
    }

    if (!initialUser && !password) {
      nextErrors.password = "Password is required.";
    } else if (password && password.length < 6) {
      nextErrors.password = "Password must contain at least 6 characters.";
    }

    const isSubAdmin =
      String(role).toLowerCase().replace(/[\s-]/g, "") === "subadmin";
      
    if (selectedPages.length === 0) {
      nextErrors.permissions = "Please select at least one page.";
    } else if (isSubAdmin) {
      const pageWithoutActions = selectedPages.find(
        (route) => (pagePermissions[route] || []).length === 0,
      );

      if (pageWithoutActions) {
        const pageLabel =
          permissionRoutes.find((page) => page.path === pageWithoutActions)
            ?.label || pageWithoutActions;

        nextErrors.permissions = `Select at least one action for "${pageLabel}".`;
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // Preserve the existing API payload format.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (isSubmitting || !validateForm()) return;

   
const userData = {
  name: name.trim(),
  email: email.trim(),
  role: isSubAdmin ? "sub-admin" : "admin",
  status,

  permissions: selectedPages
    .filter((route) => {
      if (!isSubAdmin) return true;

      const page = permissionRoutes.find((item) => item.path === route);

      return !String(page?.label || "")
        .toLowerCase()
        .includes("subadmin management");
    })

    .map((route) => {
      const page = permissionRoutes.find((item) => item.path === route);

      return {
        route,
        order: getPageOrder(page || { label: route }) + 1,
        actions: isSubAdmin
          ? [
              "view",
              ...(pagePermissions[route] || []).filter(
                (action) => action !== "view",
              ),
            ]
          : [],
      };
    }),
};


    if (password) {
      userData.password = password;
    }

    if (!onCreate) {
      console.log("User data:", userData);
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate(userData);
      onClose?.();
    } catch (error) {
      console.error("Failed to save subadmin:", error);
       setSubmitError(
         error?.response?.data?.message ||
           error?.message ||
           "Unable to save user. Please try again.",
       );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={style.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <form className={style.modal} onSubmit={handleSubmit} noValidate>
        {/* HEADER */}
        <header className={style.modalHeader}>
          <div>
            <h2 className={style.modalTitle}>
              {initialUser ? "Edit User" : "Add User"}
            </h2>

            <p className={style.modalSubtitle}>
              Fill in the details and choose what this user can access.
            </p>
          </div>

          <button
            type="button"
            className={style.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </header>

        <div className={style.modalBody}>
          {/* USER DETAILS */}
          {/* USER DETAILS */}
          <section className={style.userDetails}>
            {/* FIRST ROW: NAME + ROLE */}
            <div className={style.fieldGroup}>
              <label className={style.label}>
                Name <span className={style.required}>*</span>
              </label>

              <input
                type="text"
                className={`${style.input} ${
                  errors.name ? style.inputError : ""
                }`}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearError("name");
                }}
                placeholder="Full name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />

              {errors.name && <p className={style.errorText}>{errors.name}</p>}
            </div>

            <div className={style.fieldGroup}>
              <label className={style.label}>Role</label>

              <select
                className={style.input}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {!isLoggedInAdmin && <option value="Admin">Admin</option>}

                <option value="Sub Admin">Sub Admin</option>
              </select>
            </div>

            {/* SECOND ROW: EMAIL + PASSWORD + STATUS */}
            <div className={style.userDetailsBottom}>
              {/* EMAIL */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  E-mail <span className={style.required}>*</span>
                </label>

                <input
                  type="email"
                  className={`${style.input} ${
                    errors.email ? style.inputError : ""
                  }`}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError("email");
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />

                {errors.email && (
                  <p className={style.errorText}>{errors.email}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className={style.fieldGroup}>
                <label className={style.label}>
                  Password{" "}
                  {!initialUser && <span className={style.required}>*</span>}
                </label>

                <input
                  type="text"
                  className={`${style.input} ${
                    errors.password ? style.inputError : ""
                  }`}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  placeholder={
                    initialUser
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                />

                {errors.password && (
                  <p className={style.errorText}>{errors.password}</p>
                )}
              </div>

              {/* STATUS */}
              <div className={style.statusField}>
                <label className={style.label}>Status</label>

                <button
                  type="button"
                  className={`${style.statusToggle} ${
                    status === "active"
                      ? style.statusActive
                      : style.statusInactive
                  }`}
                  onClick={() =>
                    setStatus((previous) =>
                      previous === "active" ? "inactive" : "active",
                    )
                  }
                  aria-pressed={status === "active"}
                  disabled={isSubmitting}
                >
                  <span>{status === "active" ? "Active" : "Inactive"}</span>
                  <span className={style.toggleCircle} />
                </button>
              </div>
            </div>
          </section>

          {/* PERMISSIONS */}
          <section className={style.permissionSection}>
            <div className={style.permissionHeading}>
              <div>
                <h3 className={style.sectionTitle}>Permissions</h3>
                <p className={style.sectionDescription}>
                  Select default actions, then configure each page separately.
                </p>
              </div>

              <span className={style.countBadge}>
                {selectedPages.length}/{permissionRoutes.length} selected
              </span>
            </div>

            {/* COMMON ACTIONS */}
            {/* COMMON ACTIONS — Show only for Sub Admin */}
            {isSubAdmin && (
              <section className={style.commonActions}>
                <div className={style.commonActionsHeader}>
                  <strong>
                    1. Actions <span>(Default for selected pages)</span>
                  </strong>

                  <span className={style.commonActionCount}>
                    {commonActions.length}/{ACTIONS.length} selected
                  </span>
                </div>

                <label className={style.selectAllActions}>
                  <input
                    type="checkbox"
                    checked={allCommonActionsSelected}
                    onChange={toggleAllCommonActions}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          commonActions.length > 0 && !allCommonActionsSelected;
                      }
                    }}
                  />
                  <span>Actions (Select all)</span>
                </label>

                <div className={style.commonActionGrid}>
                  {ACTIONS.map((action) => (
                    <label key={action} className={style.actionOption}>
                      <input
                        type="checkbox"
                        checked={
                          action === "view" || commonActions.includes(action)
                        }
                        onChange={() => toggleCommonAction(action)}
                        disabled={action === "view"}
                      />
                      <span>{getActionLabel(action)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* PAGE ACCESS */}
            <section className={style.pageAccessSection}>
              <div className={style.pageAccessHeader}>
                <strong>2. Page Access</strong>

                <span className={style.commonActionCount}>
                  {selectedPages.length}/{availablePermissionRoutes.length}{" "}
                  selectedselected
                </span>
              </div>

              <input
                type="search"
                className={style.searchInput}
                placeholder="Search pages..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search pages"
              />

              <label className={style.selectAllRow}>
                <input
                  type="checkbox"
                  checked={allPagesSelected}
                  onChange={toggleAllPages}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate =
                        selectedPages.length > 0 && !allPagesSelected;
                    }
                  }}
                  disabled={availablePermissionRoutes.length === 0}
                />
                <span>Select all pages</span>
              </label>

              {/* THREE CARDS PER ROW ON DESKTOP */}
              <div className={style.pageGrid}>
                {filteredPages.map((page) => {
                  const route = page.path;

                  const isSelected = Object.prototype.hasOwnProperty.call(
                    pagePermissions,
                    route,
                  );

                  const isExpanded = expandedRoutes.has(route);
                  const actions = pagePermissions[route] || [];

                  const allActionsSelected =
                    ACTIONS.length > 0 &&
                    ACTIONS.every((action) => actions.includes(action));

                  return (
                    <article
                      key={route}
                      className={`${style.pageCard} ${
                        isSelected ? style.pageCardSelected : ""
                      }`}
                    >
                      {/* PAGE ROW */}
                      <div className={style.pageRow}>
                        <label className={style.pageLabel}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePage(route)}
                          />

                          <span>
                            {page.label === "Fees"
                              ? "Fee Management"
                              : page.label === "Placement"
                                ? "Placement Management"
                                : page.label}
                          </span>
                        </label>

                        <div className={style.pageControls}>
                          {isSubAdmin && (
                            <>
                              <span className={style.actionCount}>
                                {actions.length}/{ACTIONS.length}
                              </span>

                              {isSelected && (
                                <button
                                  type="button"
                                  className={`${style.accordionButton} ${
                                    isExpanded
                                      ? style.accordionButtonExpanded
                                      : ""
                                  }`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleAccordion(route);
                                  }}
                                  aria-label={`${
                                    isExpanded ? "Collapse" : "Expand"
                                  } ${page.label} actions`}
                                  aria-expanded={isExpanded}
                                >
                                  <FaEdit />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* INDIVIDUAL ROUTE ACTIONS */}
                      {isSubAdmin && isSelected && isExpanded && (
                        <div className={style.pageActions}>
                          <div className={style.pageActionsHeader}>
                            <strong>Actions for {page.label}</strong>

                            <button
                              type="button"
                              className={style.resetButton}
                              onClick={() => resetPageActions(route)}
                            >
                              Use defaults
                            </button>
                          </div>

                          <label className={style.selectAllActions}>
                            <input
                              type="checkbox"
                              checked={allActionsSelected}
                              ref={(element) => {
                                if (element) {
                                  element.indeterminate =
                                    actions.length > 0 && !allActionsSelected;
                                }
                              }}
                              onChange={() => toggleAllActions(route)}
                            />

                            <span>Select all actions</span>
                          </label>

                          <div className={style.actionGrid}>
                            {ACTIONS.map((action) => (
                              <label
                                key={action}
                                className={style.actionOption}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    action === "view" ||
                                    actions.includes(action)
                                  }
                                  onChange={() => toggleAction(route, action)}
                                  disabled={action === "view"}
                                />

                                <span>{getActionLabel(action)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}

                {filteredPages.length === 0 && (
                  <p className={style.noResults}>No pages found.</p>
                )}
              </div>

              {errors.permissions && (
                <p className={style.errorText}>{errors.permissions}</p>
              )}
            </section>
          </section>
          {submitError && (
            <p className={style.errorText} role="alert">
              {submitError}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <footer className={style.modalFooter}>
          <button
            type="button"
            className={style.cancelButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={style.createButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : initialUser ? "Update" : "Create"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default SubAdminManagementModel;
