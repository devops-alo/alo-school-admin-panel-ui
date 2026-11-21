import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FiAlertTriangle, FiCheckCircle, FiMapPin, FiImage, FiInfo } from "react-icons/fi";
import styles from "./CheckInVerification.module.css";

// Selfie, distance and the day's laptop flags for one attendance row, with a
// details dialog. `formatTime` is the page's formatter (times are stored
// shifted to IST, so they are shown in UTC).
//
// The laptop is identified only by the browser ID, sent at check-in, break
// out, break in and check-out. A step is flagged when another student used
// the same browser ID earlier that day ("shared"), or when it is not the
// browser ID the student checked in with ("switched").

const formatDistance = (m) =>
  m === null || m === undefined ? null : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

const EVENT_LABEL = {
  checkIn: "Check-in",
  breakOut: "Break out",
  breakIn: "Break in",
  checkOut: "Check-out",
};

const eventName = (event) => EVENT_LABEL[event] || EVENT_LABEL.checkIn;

// "A", "A and B", "A, B and C"
const joinWords = (list) =>
  list.length <= 1 ? list.join("") : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;

const uniqueNames = (people) => [...new Set(people.map((s) => s.name || "another student"))];

// Check-in plus every break / check-out, in order
const daySteps = (item, v) => [
  {
    event: "checkIn",
    at: item.inTime,
    deviceId: v.deviceId,
    sharedWith: v.sharedWith || [],
    differentLaptop: false,
  },
  ...(item.deviceLog || []),
];

const isFlagged = (step) => step.sharedWith?.length > 0 || step.differentLaptop;

// "Laptop 1" = the check-in laptop, "Laptop 2" = the next different one, ...
const laptopNames = (steps) => {
  const names = {};
  steps.forEach((s) => {
    if (s.deviceId && !names[s.deviceId]) names[s.deviceId] = `Laptop ${Object.keys(names).length + 1}`;
  });
  return names;
};

// Plain-language summary of the day's flags
const summarize = (steps) => {
  const shared = uniqueNames(steps.flatMap((s) => s.sharedWith || []));
  const switchedAt = steps.filter((s) => s.differentLaptop).map((s) => eventName(s.event).toLowerCase());
  const lines = [];
  if (shared.length) lines.push(`Used a laptop that ${joinWords(shared)} also used today.`);
  if (switchedAt.length) lines.push(`Used a different laptop at ${joinWords(switchedAt)}.`);
  return { shared, switched: switchedAt.length > 0, lines };
};

const SelfieImage = ({ v, className }) => {
  if (v?.selfieUrl) return <img src={v.selfieUrl} alt="Check-in selfie" className={className} loading="lazy" />;
  return (
    <div className={`${className} ${styles.noSelfie}`}>
      <FiImage />
      <span>{v?.selfieDeleted ? "Deleted" : "No selfie"}</span>
    </div>
  );
};

const CheckInVerification = ({ item, formatTime }) => {
  const [open, setOpen] = useState(false);
  const v = item?.checkInVerification;

  if (!v) return <span className={styles.none}>-</span>;

  const steps = daySteps(item, v);
  const summary = summarize(steps);
  const flagged = summary.lines.length > 0;
  const laptops = laptopNames(steps);
  const laterNames = uniqueNames(v.laterUsedBy || []);
  const distance = formatDistance(v.distance);
  const name = item.userDetails?.name || item.name;
  const time = (t) => (t ? formatTime(t) : "--:--");
  // "9:46 AM" for a check-in, "break out 1:02 PM" otherwise
  const usedWhen = (s) =>
    `${s.event && s.event !== "checkIn" ? `${eventName(s.event).toLowerCase()} ` : ""}${time(s.inTime)}`;

  // Short text for the table chip
  const chipText = summary.shared.length
    ? `Shared laptop with ${summary.shared[0]}${summary.shared.length > 1 ? ` +${summary.shared.length - 1}` : ""}`
    : "Switched laptop";

  return (
    <>
      <button type="button" className={styles.cell} onClick={() => setOpen(true)} title="View check-in details">
        <SelfieImage v={v} className={styles.thumb} />
        <span className={styles.cellText}>
          <span className={styles.meta}>
            {distance ? (
              <>
                <FiMapPin /> {distance}
              </>
            ) : (
              <>
                <FiMapPin /> Campus not set
              </>
            )}
            {v.faceCheck === "skipped" && <span className={styles.skipped}>Face check skipped</span>}
          </span>
          {flagged && (
            <span className={styles.flag} title={summary.lines.join(" ")}>
              <FiAlertTriangle /> {chipText}
            </span>
          )}
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className={styles.dialogTitle}>
          <span>
            Check-in details
            <small>
              {name}
              {item.inTime ? ` · ${formatTime(item.inTime)}` : ""}
            </small>
          </span>
          <IconButton onClick={() => setOpen(false)} size="small" aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div className={styles.layout}>
            <div className={styles.left}>
              {v.selfieUrl ? (
                <a href={v.selfieUrl} target="_blank" rel="noreferrer" className={styles.bigLink}>
                  <SelfieImage v={v} className={styles.big} />
                </a>
              ) : (
                <SelfieImage v={v} className={styles.big} />
              )}
              {v.selfieDeleted && (
                <p className={styles.muted}>Selfies are deleted 14 days after check-in.</p>
              )}

              <dl className={styles.details}>
                <dt>Face check</dt>
                <dd>
                  {v.faceCheck === "passed" ? (
                    <span className={styles.ok}>
                      <FiCheckCircle /> Face detected
                    </span>
                  ) : (
                    <span className={styles.skipped}>Skipped (face detector did not load) - check the selfie</span>
                  )}
                </dd>

                <dt>Location</dt>
                <dd>
                  {distance ? `${distance} from campus` : "Campus location was not set"}
                  {v.accuracy ? ` (±${formatDistance(v.accuracy)} accuracy)` : ""}
                  {v.latitude !== null && v.longitude !== null && (
                    <>
                      {" · "}
                      <a
                        href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on map
                      </a>
                    </>
                  )}
                </dd>
              </dl>
            </div>

            <div className={styles.right}>
              <h4 className={styles.sectionTitle}>Laptop used today</h4>

              {flagged ? (
                <div className={`${styles.summary} ${styles.summaryWarn}`}>
                  <FiAlertTriangle />
                  <div>
                    {summary.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`${styles.summary} ${styles.summaryOk}`}>
                  <FiCheckCircle />
                  <p>Same laptop all day, not used by any other student.</p>
                </div>
              )}

              <ol className={styles.timeline}>
                {steps.map((step, i) => (
                  <li key={`${step.event}-${i}`} className={isFlagged(step) ? styles.stepFlagged : styles.step}>
                    <span className={styles.stepEvent}>{eventName(step.event)}</span>
                    <span className={styles.stepTime}>{time(step.at)}</span>
                    <span className={styles.laptop} title={`Browser ID: ${step.deviceId || "-"}`}>
                      {laptops[step.deviceId] || "Unknown laptop"}
                    </span>
                    <span className={styles.tags}>
                      {step.differentLaptop && <span className={styles.tag}>Different laptop</span>}
                      {step.sharedWith?.length > 0 && (
                        <span
                          className={styles.sharedText}
                          title={step.sharedWith
                            .map((s) => `${s.name || "Another student"}${s.studentId ? ` (${s.studentId})` : ""}`)
                            .join("\n")}
                        >
                          Same laptop used earlier by{" "}
                          {joinWords(step.sharedWith.map((s) => `${s.name || "another student"} (${usedWhen(s)})`))}
                        </span>
                      )}
                      {!isFlagged(step) && (
                        <span className={styles.ok}>
                          <FiCheckCircle /> OK
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>

              {laterNames.length > 0 && (
                <p
                  className={styles.laterNote}
                  title={v.laterUsedBy
                    .map((s) => `${s.name || "Another student"}: ${eventName(s.event).toLowerCase()}${s.inTime ? ` ${formatTime(s.inTime)}` : ""}`)
                    .join("\n")}
                >
                  <FiInfo /> Later, {joinWords(laterNames)} used this student's laptop.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInVerification;
