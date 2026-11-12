import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiMinus,
  FiMousePointer,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { RiChatQuoteLine } from "react-icons/ri";
import Modal from "../../components/modal/Modal";
import { hasActionAccess } from "../utils/permissions";
import styles from "./DailyQuotes.module.css";
import {
  addDailyQuoteApi,
  deleteDailyQuoteApi,
  getDailyQuoteSettingsApi,
  getDailyQuotesApi,
  updateDailyQuoteApi,
  updateDailyQuoteSettingsApi,
} from "../../api/Serviceapi";

// The motivation quotes students pick from after checking in (student panel),
// and how many face-down cards they pick from.

const ROUTE = "/daily-quotes";
const TEXT_MAX = 500;
const AUTHOR_MAX = 100;
const PAGE_SIZE = 10;
const EMPTY_FORM = { text: "", author: "" };

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const formatDate = (date) => {
  if (!date) return "-";
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "-" : format(value, "dd MMM yyyy");
};

const StatCard = ({ tone, icon, label, value, note, loading, children }) => (
  <div className={`${styles.statCard} ${styles[tone]}`}>
    <div className={styles.statTop}>
      <span className={styles.statIcon} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.statBody}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{loading ? "…" : value}</span>
        {note && <span className={styles.statNote}>{note}</span>}
      </div>
    </div>
    {children}
  </div>
);

const DailyQuotes = () => {
  const canView = hasActionAccess(ROUTE, "view");
  const canAdd = hasActionAccess(ROUTE, "add");
  const canEdit = hasActionAccess(ROUTE, "edit");
  const canDelete = hasActionAccess(ROUTE, "delete");

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  // The summary numbers keep their values while the table reloads
  const [stats, setStats] = useState(null); // { totalCount, activeCount, pickedToday }
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState("");
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState(""); // debounced
  const [togglingId, setTogglingId] = useState("");
  const latestRequest = useRef(0);

  const [cardCount, setCardCount] = useState(null);
  const [countInput, setCountInput] = useState("");
  const [countRange, setCountRange] = useState({ min: 2, max: 50 });
  const [savingCount, setSavingCount] = useState(false);

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | "delete"
  const [activeQuote, setActiveQuote] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Only the latest request fills the table, so a slow reply for an earlier
  // tab, page or search can't replace a newer one
  const fetchQuotes = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    try {
      const response = await getDailyQuotesApi({
        offset: page - 1,
        limit: PAGE_SIZE,
        value: searchValue.trim(),
        status: statusTab,
      });
      if (request !== latestRequest.current) return;
      const data = response?.data?.data || {};
      const rows = data.data || [];
      const totalCount = data.totalCount || 0;
      // The last quote on a page was deleted: show the page before it
      if (!rows.length && page > 1 && totalCount > 0) {
        setPage((prev) => prev - 1);
        return;
      }
      setQuotes(rows);
      setStats({
        totalCount,
        activeCount: data.activeCount || 0,
        pickedToday: data.pickedToday || 0,
      });
    } catch (err) {
      if (request !== latestRequest.current) return;
      setQuotes([]);
      toast.error(errorMessage(err, "Unable to load quotes"));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [page, searchValue, statusTab]);

  useEffect(() => {
    if (canView) fetchQuotes();
  }, [canView, fetchQuotes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!canView) return;
    getDailyQuoteSettingsApi()
      .then((response) => {
        const data = response?.data?.data || {};
        setCardCount(data.cardCount);
        setCountInput(String(data.cardCount ?? ""));
        setCountRange({ min: data.minCardCount ?? 2, max: data.maxCardCount ?? 50 });
      })
      .catch((err) => toast.error(errorMessage(err, "Couldn't load the card count")));
  }, [canView]);

  // ---------- Cards shown to students ----------

  const countNumber = Number(countInput);
  const countValid =
    countInput !== "" &&
    Number.isInteger(countNumber) &&
    countNumber >= countRange.min &&
    countNumber <= countRange.max;
  const countChanged = countValid && countNumber !== cardCount;

  const stepCount = (delta) => {
    const current = countValid ? countNumber : countRange.min;
    const next = Math.min(countRange.max, Math.max(countRange.min, current + delta));
    setCountInput(String(next));
  };

  const saveCardCount = async () => {
    if (!countValid || !countChanged || savingCount) return;
    setSavingCount(true);
    try {
      await updateDailyQuoteSettingsApi(countNumber);
      setCardCount(countNumber);
      toast.success(`Students will now see ${countNumber} cards`);
    } catch (err) {
      toast.error(errorMessage(err, "Something went wrong!"));
    } finally {
      setSavingCount(false);
    }
  };

  // ---------- Quotes ----------

  const openAddModal = () => {
    setActiveQuote(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalMode("add");
  };

  const openEditModal = (quote) => {
    setActiveQuote(quote);
    setForm({ text: quote.text || "", author: quote.author || "" });
    setErrors({});
    setModalMode("edit");
  };

  const openDeleteModal = (quote) => {
    setActiveQuote(quote);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveQuote(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const text = form.text.trim();
    if (!text) {
      setErrors({ text: "Quote is required" });
      return;
    }
    const isEdit = modalMode === "edit";
    setSaving(true);
    try {
      const payload = { text, author: form.author.trim() };
      if (isEdit) {
        await updateDailyQuoteApi(activeQuote._id, payload);
      } else {
        await addDailyQuoteApi(payload);
      }
      toast.success(isEdit ? "Quote updated successfully" : "Quote added successfully");
      closeModal();
      // New quotes are listed first
      if (!isEdit && page !== 1) {
        setPage(1);
      } else {
        fetchQuotes();
      }
    } catch (err) {
      const message = errorMessage(err, "Something went wrong!");
      if (message === "This quote already exists") {
        setErrors({ text: message });
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Inactive quotes aren't given out any more; anyone who already picked one today still sees it
  const toggleStatus = async (quote) => {
    if (togglingId) return;
    const status = quote.status === "active" ? "inactive" : "active";
    setTogglingId(quote._id);
    try {
      await updateDailyQuoteApi(quote._id, { status });
      toast.success(`Quote is now ${status}`);
      fetchQuotes();
    } catch (err) {
      toast.error(errorMessage(err, "Unable to update status"));
    } finally {
      setTogglingId("");
    }
  };

  const handleDelete = async () => {
    if (!activeQuote || deleting) return;
    setDeleting(true);
    try {
      await deleteDailyQuoteApi(activeQuote._id);
      toast.success("Quote deleted successfully");
      closeModal();
      fetchQuotes();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete quote"));
    } finally {
      setDeleting(false);
    }
  };

  if (!canView) {
    return (
      <main className={styles.page}>
        <p className={styles.accessDenied} role="alert">
          You do not have permission to view Daily Quotes.
        </p>
      </main>
    );
  }

  const totalCount = stats?.totalCount || 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);
  const showActions = canEdit || canDelete;
  const columnCount = showActions ? 5 : 4;

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Daily Quotes</h1>
          <p className={styles.subtitle}>
            Students pick a card after checking in and get one of these quotes. No one sees
            the same quote twice until they&apos;ve seen them all.
          </p>
        </div>
        {canAdd && (
          <button type="button" className={styles.primaryButton} onClick={openAddModal}>
            <FiPlus aria-hidden="true" />
            Add Quote
          </button>
        )}
      </div>

      <div className={styles.stats}>
        <StatCard
          tone="blue"
          icon={<RiChatQuoteLine />}
          label="Active quotes"
          value={stats?.activeCount ?? 0}
          note="In the deck right now"
          loading={!stats}
        />
        <StatCard
          tone="green"
          icon={<FiMousePointer />}
          label="Picked today"
          value={stats?.pickedToday ?? 0}
          note="Students who turned a card"
          loading={!stats}
        />
        <StatCard
          tone="orange"
          icon={<FiLayers />}
          label="Cards shown to students"
          value={cardCount ?? "-"}
          note={`From ${countRange.min} to ${countRange.max} cards`}
          loading={cardCount === null}
        >
          {canEdit && cardCount !== null && (
            <div className={styles.stepperRow}>
              <div className={styles.stepper}>
                <button
                  type="button"
                  aria-label="Fewer cards"
                  disabled={savingCount || (countValid && countNumber <= countRange.min)}
                  onClick={() => stepCount(-1)}
                >
                  <FiMinus aria-hidden="true" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={countRange.min}
                  max={countRange.max}
                  step={1}
                  value={countInput}
                  aria-label="Cards shown to students"
                  aria-invalid={!countValid}
                  onChange={(e) => setCountInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCardCount();
                  }}
                />
                <button
                  type="button"
                  aria-label="More cards"
                  disabled={savingCount || (countValid && countNumber >= countRange.max)}
                  onClick={() => stepCount(1)}
                >
                  <FiPlus aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                className={styles.saveButton}
                disabled={!countChanged || savingCount}
                onClick={saveCardCount}
              >
                {savingCount ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </StatCard>
      </div>

      <section className={styles.tableCard} aria-label="Quotes">
        <div className={styles.tableHead}>
          <div className={styles.tabs} role="tablist" aria-label="Filter by status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={statusTab === tab.value}
                className={`${styles.tab} ${statusTab === tab.value ? styles.tabActive : ""}`}
                onClick={() => {
                  setStatusTab(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search quote or author"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search quote or author"
            />
          </label>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.quotesTable}>
            <thead>
              <tr>
                <th scope="col">Quote</th>
                <th scope="col">Author</th>
                <th scope="col">Added</th>
                <th scope="col">Status</th>
                {showActions && <th scope="col">Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className={styles.emptyState} role="status">
                    Loading quotes...
                  </td>
                </tr>
              ) : quotes.length > 0 ? (
                quotes.map((quote) => {
                  const active = quote.status === "active";
                  return (
                    <tr key={quote._id} className={loading ? styles.rowLoading : undefined}>
                      <td className={styles.quoteCell}>{quote.text}</td>
                      <td className={styles.authorCell}>{quote.author || "-"}</td>
                      <td className={styles.dateCell}>{formatDate(quote.createdAt)}</td>
                      <td>
                        {canEdit ? (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={active}
                            aria-label={active ? "Active, click to deactivate" : "Inactive, click to activate"}
                            className={`${styles.switch} ${active ? styles.switchOn : ""}`}
                            disabled={togglingId === quote._id}
                            onClick={() => toggleStatus(quote)}
                          >
                            <span className={styles.switchKnob} />
                            <span className={styles.switchText}>
                              {active ? "Active" : "Inactive"}
                            </span>
                          </button>
                        ) : (
                          <span
                            className={`${styles.statusBadge} ${
                              active ? styles.enabled : styles.disabled
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      {showActions && (
                        <td>
                          <div className={styles.rowActions}>
                            {canEdit && (
                              <button
                                type="button"
                                className={styles.editButton}
                                onClick={() => openEditModal(quote)}
                                aria-label="Edit quote"
                              >
                                <FaEdit aria-hidden="true" />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() => openDeleteModal(quote)}
                                aria-label="Delete quote"
                              >
                                <FaTrash aria-hidden="true" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columnCount} className={styles.emptyState}>
                    <strong>
                      {searchValue || statusTab ? "No matching quotes" : "No quotes added yet"}
                    </strong>
                    <span>
                      {searchValue || statusTab
                        ? "Try another search or status."
                        : "Add a quote for students to pick after checking in."}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCount > PAGE_SIZE && (
          <div className={styles.pagination}>
            <span>
              {rangeStart}-{rangeEnd} of {totalCount}
            </span>
            <div className={styles.pageButtons}>
              <button
                type="button"
                aria-label="Previous page"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                aria-label="Next page"
                disabled={page >= pageCount || loading}
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>

      <Modal
        open={modalMode === "add" || modalMode === "edit"}
        title={modalMode === "edit" ? "Edit Quote" : "Add Quote"}
        onClose={closeModal}
        width={560}
        closeOnOverlayClick={false}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span>
              Quote <em>*</em>
            </span>
            <textarea
              autoFocus
              rows={4}
              maxLength={TEXT_MAX}
              placeholder="e.g. The expert in anything was once a beginner."
              value={form.text}
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? "quote-text-error" : undefined}
              onChange={(e) => {
                setForm((current) => ({ ...current, text: e.target.value }));
                setErrors((prev) => ({ ...prev, text: "" }));
              }}
            />
            <span className={styles.fieldFoot}>
              {errors.text ? (
                <span className={styles.error} id="quote-text-error" role="alert">
                  {errors.text}
                </span>
              ) : (
                <span />
              )}
              <span className={styles.counter}>
                {form.text.length}/{TEXT_MAX}
              </span>
            </span>
          </label>

          <label className={styles.field}>
            <span>Author</span>
            <input
              type="text"
              maxLength={AUTHOR_MAX}
              placeholder="e.g. Helen Hayes (optional)"
              value={form.author}
              onChange={(e) => setForm((current) => ({ ...current, author: e.target.value }))}
            />
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.secondaryButton} onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {modalMode === "edit"
                ? saving
                  ? "Saving..."
                  : "Save Changes"
                : saving
                  ? "Adding..."
                  : "Add Quote"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalMode === "delete"}
        title="Delete Quote"
        onClose={closeModal}
        width={460}
        animateClose
      >
        <div className={styles.deleteConfirmation}>
          <p>Students won&apos;t get this quote any more. This cannot be undone.</p>
          {activeQuote && <p className={styles.deleteQuoteText}>“{activeQuote.text}”</p>}
          <div className={styles.modalActions}>
            <button type="button" className={styles.secondaryButton} onClick={closeModal}>
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

export default DailyQuotes;
