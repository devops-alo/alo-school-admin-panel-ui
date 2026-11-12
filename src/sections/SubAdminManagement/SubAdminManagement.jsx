import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import style from "./SubAdminManagement.module.css";
import SubAdminManagementModal from "../../model/SubAdminManagementModel/SubadminManagementModel";
import {
  getUsersApi,
  createUserApi,
  deleteUserApi,
  updateUserStatusApi,
  editUserApi,
  getUserByIdApi,
} from "../../api/Serviceapi";
import { getUserRole } from "../../sections/utils/permissions";

const SubadminManagement = ({ permissionRoutes = [] }) => {
  const loggedInRole = getUserRole();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");

  // =========================================
  // FETCH USERS FROM GET /user
  // =========================================

 const fetchUsers = useCallback(async () => {
   try {
     setIsLoading(true);
     setError("");

     const offset = currentPage - 1;
    const apiRoleFilter =
      loggedInRole === "super-admin"
        ? roleFilter === "all"
          ? "admin,sub-admin"
          : roleFilter
        : "sub-admin";

    const response = await getUsersApi(search, pageSize, offset, apiRoleFilter);
     const responseBody = response?.data;
     const result = responseBody?.data;

     if (responseBody?.status === false) {
       throw new Error(responseBody.message || "Failed to fetch users.");
     }

     const usersArray = Array.isArray(result?.data) ? result.data : [];

     setTotalCount(result?.totalCount ?? 0);

     const formattedUsers = usersArray
       .filter((user) => !user.deleted)
       .map((user) => ({
         id: user._id,
         name: user.name || "Unnamed User",
         email: user.email || "",
         password: user.password || user.secret || "",
         role:
           user.role?.toLowerCase().replace(/[\s_-]/g, "") === "admin"
             ? "Admin"
             : "Sub Admin",
         permissions: Array.isArray(user.permissions)
           ? user.permissions.length
           : (user.selectedRouteCount ?? 0),
         permissionDetails: Array.isArray(user.permissions)
           ? user.permissions
           : [],
         isActive: user.status?.toLowerCase() === "active",
         status: user.status,
         rawUser: user,
       }));

     const visibleUsers = formattedUsers.filter((user) => {
       if (loggedInRole === "super-admin") {
         return true;
       }

       if (loggedInRole === "admin") {
         return user.role === "Sub Admin";
       }

       return false;
     });

     setUsers(visibleUsers);
   } catch (err) {
     console.error("Failed to fetch users:", err);

     setError(
       err?.response?.data?.message ||
         err?.message ||
         "Unable to load users. Please try again.",
     );
   } finally {
     setIsLoading(false);
   }
 }, [search, currentPage, pageSize, loggedInRole, roleFilter]);

 useEffect(() => {
   fetchUsers();
 }, [fetchUsers]);



  // =========================================
  // COUNTS
  // =========================================

  const activeCount = users.filter((user) => user.isActive).length;
  const inactiveCount = users.length - activeCount;

  // =========================================
  // SEARCH + STATUS FILTER
  // =========================================

 const filteredUsers = useMemo(() => {
   return users.filter((user) =>
     activeTab === "active" ? user.isActive : !user.isActive,
   );
 }, [users, activeTab]);

  // =========================================
  // MODAL
  // =========================================

  const openAddModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

const openEditModal = async (user) => {
  try {
    setError("");

    const response = await getUserByIdApi(user.id);

    if (response?.data?.status !== true) {
      throw new Error(
        response?.data?.message || "Failed to fetch user details.",
      );
    }

    // Your API returns user details inside response.data.data
    const userData = response.data.data;

    setEditingUser({
      id: userData._id,
      name: userData.name || "",
      email: userData.email || "",
      password: userData.password || "",
      role:
        userData.role?.toLowerCase().replace(/[\s_-]/g, "") === "admin"
          ? "Admin"
          : "Sub Admin",
      status: userData.status || "active",
      permissions: Array.isArray(userData.permissions)
        ? userData.permissions
        : [],
    });

    setShowModal(true);
  } catch (err) {
    console.error("Failed to fetch user details:", err);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Unable to load user details. Please try again.",
    );
  }
};
  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // This maintains the existing modal callback.
  // Connect the POST/PUT service here when available.
  


const handleSaveUser = async (formData) => {
  try {
    const isAdmin =
      formData.role?.toLowerCase().replace(/[\s_-]/g, "") === "admin";

    const payload = {
      name: formData.name?.trim(),
      email: formData.email?.trim(),
      role: isAdmin ? "admin" : "sub-admin",
      status: formData.status,
      permissions: Array.isArray(formData.permissions)
        ? formData.permissions
            .map((permission) => ({
              ...permission,
              actions: (permission.actions || []).filter(
                (action) => action.toLowerCase() !== "approve",
              ),
            }))
        : [],
    };

    // Validate required fields
    if (!payload.name || !payload.email) {
      throw new Error("Name and email are required.");
    }

    // Password is required only when creating a user
    if (!editingUser && !formData.password?.trim()) {
      throw new Error("Password is required.");
    }

    // Include password only when provided
    if (formData.password?.trim()) {
      payload.password = formData.password;
    }

    setError("");

   if (editingUser?.id) {
     console.log("Editing user ID:", editingUser.id);
     console.log("Payload being sent:", payload);
     console.log("Updated permissions:", payload.permissions);

     const response = await editUserApi(editingUser.id, payload);

     console.log("Update API response:", response.data);

     if (response?.data?.status === false) {
       throw new Error(response.data.message || "Failed to update user.");
     }
   } else {
     const response = await createUserApi(payload);

     if (response?.data?.status === false) {
       throw new Error(response.data.message || "Failed to create user.");
     }
   }

    await fetchUsers();
   toast.success(
     editingUser?.id
       ? "User updated successfully."
       : "User created successfully.",
   );
   closeModal();
  } catch (err) {
   console.error("Failed to save user:", err);
   toast.error(
     err?.response?.data?.message || err?.message || "Failed to save user.",
   );

   throw err;
  }
};


 
  // =========================================
  // STATUS TOGGLE
  // =========================================

 const toggleStatus = async (userId) => {
   const user = users.find((item) => item.id === userId);

   if (!user) return;

   const newStatus = user.isActive ? "inactive" : "active";

   try {
     setError("");

     await updateUserStatusApi(userId, newStatus);

     await fetchUsers();
   } catch (err) {
     console.error("Failed to update user status:", err);

     setError(
       err?.response?.data?.message ||
         "Failed to update user status. Please try again.",
     );
   }
 };

  // =========================================
  // DELETE
  // =========================================

 
const confirmDelete = async () => {
  if (!deleteUserId) return;

  try {
    setError("");

    const response = await deleteUserApi(deleteUserId);

    if (response?.data?.status === false) {
      throw new Error(response.data.message || "Failed to delete user.");
    }

    // Refresh the table from the backend.
    await fetchUsers();

    // Close the confirmation modal after success.
    setDeleteUserId(null);
  } catch (err) {
    console.error("Failed to delete user:", err);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Unable to delete user. Please try again.",
    );
  }
};


  // =========================================
  // RENDER
  // =========================================

  return (
    <div className={style.userManagement}>
      {/* PAGE HEADER */}
      <div className={style.pageHeader}>
        <div>
          <h1>User Management</h1>
          <p>
            Create admins and sub admins and choose which pages they can access.
          </p>
        </div>

        <button
          type="button"
          className={style.addButton}
          onClick={openAddModal}
        >
          <FaUserPlus />
          <span>Add User</span>
        </button>
      </div>

      {/* USER TABLE CONTAINER */}
      <section className={style.tableContainer}>
        {/* ACTIVE / INACTIVE TABS */}
        <div className={style.tabs}>
          <button
            type="button"
            className={`${style.tab} ${
              activeTab === "active" ? style.activeTab : ""
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active
            <span className={style.tabCount}>{activeCount}</span>
          </button>

          <button
            type="button"
            className={`${style.tab} ${
              activeTab === "inactive" ? style.activeTab : ""
            }`}
            onClick={() => setActiveTab("inactive")}
          >
            Inactive
            <span className={style.tabCount}>{inactiveCount}</span>
          </button>
        </div>

        {/* SEARCH */}

        {/* ROLE FILTER + SEARCH */}
        <div className={style.searchContainer}>
          {loggedInRole === "super-admin" && (
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter users by role"
              className={style.roleFilter}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="sub-admin">Sub Admin</option>
            </select>
          )}

          <input
            type="search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search users"
          />
        </div>

        {/* LOADING / ERROR / TABLE */}
        {isLoading ? (
          <div className={style.emptyState}>Loading users...</div>
        ) : error ? (
          <div className={style.emptyState}>
            <p>{error}</p>
            <button type="button" onClick={fetchUsers}>
              Retry
            </button>
          </div>
        ) : (
          <div className={style.tableScroll}>
            <table className={style.userTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>E-mail</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className={style.nameCell}>{user.name}</td>

                    <td className={style.emailCell}>{user.email}</td>

                    {/* GET response does not contain a password */}
                    <td className={style.passwordCell}>{user.password}</td>

                    <td>
                      <span
                        className={`${style.roleBadge} ${
                          user.role === "Admin"
                            ? style.adminBadge
                            : style.subAdminBadge
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={style.permissionBadge}
                        title={user.permissionDetails
                          .map((permission) => permission.route)
                          .join(", ")}
                      >
                        {user.permissions} selected
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`${style.statusToggle} ${
                          user.isActive
                            ? style.statusActive
                            : style.statusInactive
                        }`}
                        onClick={() => toggleStatus(user.id)}
                        aria-label={`Set ${user.name} ${
                          user.isActive ? "inactive" : "active"
                        }`}
                      >
                        <span>{user.isActive ? "Active" : "Inactive"}</span>
                        <span className={style.toggleCircle} />
                      </button>
                    </td>

                    <td>
                      <div className={style.actionButtons}>
                        <button
                          type="button"
                          className={style.editButton}
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                          aria-label={`Edit ${user.name}`}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className={style.deleteButton}
                          onClick={() => setDeleteUserId(user.id)}
                          title="Delete user"
                          aria-label={`Delete ${user.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className={style.emptyState}>
                      No {activeTab} users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className={style.tableFooter}>
          <span>
            Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, totalCount)}
            {" of "}
            {totalCount} users
          </span>

          <div className={style.pagination}>
            <button
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of{" "}
              {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>

            <button
              type="button"
              disabled={
                currentPage >= Math.ceil(totalCount / pageSize) || isLoading
              }
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <SubAdminManagementModal
          key={editingUser?.id ?? "new-user"}
          initialUser={editingUser}
          permissionRoutes={permissionRoutes}
          onClose={closeModal}
          onCreate={handleSaveUser}
        />
      )}

      {/* DELETE CONFIRMATION */}
      {deleteUserId !== null && (
        <div
          className={style.deleteOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteUserId(null);
            }
          }}
        >
          <div className={style.deleteModal}>
            <div className={style.deleteIcon}>
              <FaTrash />
            </div>

            <h2>Delete User?</h2>

            <p>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>

            <div className={style.deleteActions}>
              <button
                type="button"
                className={style.cancelDeleteButton}
                onClick={() => setDeleteUserId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={style.confirmDeleteButton}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubadminManagement;
