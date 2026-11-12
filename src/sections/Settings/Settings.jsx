
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "../../components/modal/Modal";
import { hasActionAccess } from "../utils/permissions";
import styles from "./Settings.module.css";
import {
  deleteSettingsApi,
  getSettingsApi,
  updateSettingsApi,
  addSettingsApi,
} from "../../api/Serviceapi";

const createEventKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const Settings = () => {
  const canView = hasActionAccess("/settings", "view");
  const canAdd = hasActionAccess("/settings", "add");
  const canEdit = hasActionAccess("/settings", "edit");
  const canDelete = hasActionAccess("/settings", "delete");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [form, setForm] = useState({ name: "", key: "", value: false });
  const [errors, setErrors] = useState({});
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSettingsApi();
      const records = response?.data?.data?.data;

      if (!Array.isArray(records)) {
        throw new Error("The settings response did not contain an event list.");
      }

      setEvents(
        records
          .filter((record) => record.deleted !== true)
          .map((record) => ({
            id: record._id,
            name: record.eventName,
            key: record.eventKey,
            value: String(record.value).toLowerCase() === "enabled",
          })),
      );
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load settings.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) fetchSettings();
  }, [canView, fetchSettings]);

  const openAddModal = () => {
    setEditingEvent(null);
    setForm({ name: "", key: "", value: false });
    setErrors({});
    setModalMode("add");
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setForm({ name: event.name, key: event.key, value: event.value });
    setErrors({});
    setModalMode("edit");
  };

  const openDeleteModal = (event) => {
    setDeletingEvent(event);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingEvent(null);
    setDeletingEvent(null);
    setErrors({});
  };

  const handleDelete = async () => {
    if (!deletingEvent || deleting) return;

    if (deletingEvent.isLocal) {
      setEvents((currentEvents) =>
        currentEvents.filter((item) => item.id !== deletingEvent.id),
      );
      closeModal();
      return;
    }

    try {
      setDeleting(true);
      await deleteSettingsApi(deletingEvent.id);
      closeModal();
      toast.success("Event deleted successfully.");
      await fetchSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete event.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (modalMode === "add" && adding) return;
    if (modalMode === "edit" && (updating || !editingEvent)) return;

    const name = form.name.trim();
    const key = createEventKey(modalMode === "add" ? name : form.key);
    const nextErrors = {};

    if (!name) {
      nextErrors.name = "Event name is required.";
    }

    if (!key) {
      nextErrors.key = "Enter a name that can be used to create an event key.";
    } else if (
      events.some(
        (item) =>
          item.id !== editingEvent?.id &&
          createEventKey(item.key) === key,
      )
    ) {
      nextErrors.key = "An event with this key already exists.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (modalMode === "add") {
      const payload = {
        eventName: name,
        eventKey: key,
        value: form.value ? "enabled" : "disabled",
      };

      try {
        setAdding(true);
        await addSettingsApi(payload);
        setForm({ name: "", key: "", value: false });
        setErrors({});
        closeModal();
        toast.success("Event added successfully.");
        await fetchSettings();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to add event.");
      } finally {
        setAdding(false);
      }

      return;
    }

    if (editingEvent.isLocal) {
      setEvents((currentEvents) =>
        currentEvents.map((item) =>
          item.id === editingEvent.id
            ? { ...item, name, key, value: form.value }
            : item,
        ),
      );
      closeModal();
      return;
    }

    const payload = {
      eventName: name,
      eventKey: key,
      value: form.value ? "enabled" : "disabled",
    };

    try {
      setUpdating(true);
      await updateSettingsApi(editingEvent.id, payload);
      closeModal();
      toast.success("Event updated successfully.");
      await fetchSettings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update event.");
    } finally {
      setUpdating(false);
    }
  };

  const eventKey = modalMode === "add" ? createEventKey(form.name) : form.key;

  if (!canView) {
    return (
      <main className={styles.page}>
        <p className={styles.accessDenied} role="alert">
          You do not have permission to view Settings.
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage event configurations and festival animations.
          </p>
        </div>
        {canAdd && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openAddModal}
          >
            Add Event
          </button>
        )}
      </div>

      <section className={styles.tableCard} aria-label="Event configurations">
        <div className={styles.tableScroll}>
          <table className={styles.eventsTable}>
            <thead>
              <tr>
                <th scope="col">Event</th>
                <th scope="col">Value</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className={styles.emptyState} role="status">
                    Loading settings...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={styles.eventName}>{event.name}</span>
                      <span className={styles.eventKey}>{event.key}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          event.value ? styles.enabled : styles.disabled
                        }`}
                      >
                        {event.value ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => openEditModal(event)}
                          disabled={!canEdit}
                          aria-label={`Edit ${event.name}`}
                          title={
                            canEdit
                              ? `Edit ${event.name}`
                              : "You do not have permission to edit events"
                          }
                        >
                          <FaEdit aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => openDeleteModal(event)}
                          disabled={!canDelete}
                          aria-label={`Delete ${event.name}`}
                          title={
                            canDelete
                              ? `Delete ${event.name}`
                              : "You do not have permission to delete events"
                          }
                        >
                          <FaTrash aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className={styles.emptyState}>
                    <strong>No events configured</strong>
                    <span>Add an event to manage its festival animation.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className={styles.localNotice}>
          Event settings are synced with the backend.
        </p>
      </section>

      <Modal
        open={modalMode === "add" || modalMode === "edit"}
        title={modalMode === "edit" ? "Edit Event" : "Add Event"}
        onClose={closeModal}
        width={520}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span>Event Name</span>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="e.g. New Year"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "event-name-error" : undefined}
            />
            {errors.name && (
              <span className={styles.error} id="event-name-error" role="alert">
                {errors.name}
              </span>
            )}
          </label>

          <label className={styles.field}>
            <span>Event Key</span>
            <input
              type="text"
              value={eventKey}
              readOnly={modalMode === "add"}
              onChange={(event) =>
                setForm((current) => ({ ...current, key: event.target.value }))
              }
              placeholder="Generated from event name"
              aria-invalid={Boolean(errors.key)}
              aria-describedby={errors.key ? "event-key-error" : undefined}
            />
            {errors.key && (
              <span className={styles.error} id="event-key-error" role="alert">
                {errors.key}
              </span>
            )}
          </label>

          <label className={styles.field}>
            <span>Value</span>
            <select
              value={form.value ? "enabled" : "disabled"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  value: event.target.value === "enabled",
                }))
              }
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={
                (modalMode === "add" && adding) ||
                (modalMode === "edit" && updating)
              }
            >
              {modalMode === "add"
                ? adding
                  ? "Adding..."
                  : "Add Event"
                : updating
                  ? "Saving..."
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalMode === "delete"}
        title="Delete Event"
        onClose={closeModal}
        width={460}
        animateClose
      >
        <div className={styles.deleteConfirmation}>
          <p>
            Are you sure you want to delete this event? This action cannot be
            undone.
          </p>
          {deletingEvent && (
            <p className={styles.deleteEventName}>{deletingEvent.name}</p>
          )}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmDeleteButton}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default Settings;
