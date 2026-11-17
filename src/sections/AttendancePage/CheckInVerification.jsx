import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FiAlertTriangle, FiCheckCircle, FiMapPin, FiImage, FiInfo } from "react-icons/fi";
import styles from "./CheckInVerification.module.css";

// Selfie, distance and shared-laptop flag for one check-in row, with a
// details dialog. `formatTime` is the page's formatter (in-times are stored
// shifted to IST, so they are shown in UTC).

const formatDistance = (m) =>
  m === null || m === undefined ? null : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

const MATCHED_BY = {
  deviceId: "same browser on this laptop",
  fingerprint: "same laptop (browser data cleared or identical lab PC)",
};

const shortId = (id) => (id ? (id.length > 18 ? `${id.slice(0, 18)}…` : id) : "-");

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

  const flagged = v.sharedDeviceFlag && v.sharedWith?.length > 0;
  const laterUsed = v.laterUsedBy?.length > 0;
  const distance = formatDistance(v.distance);
  const name = item.userDetails?.name || item.name;

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
            <span className={styles.flag}>
              <FiAlertTriangle /> Same laptop as {v.sharedWith[0].name || "another student"}
              {v.sharedWith.length > 1 ? ` +${v.sharedWith.length - 1}` : ""}
            </span>
          )}
          {!flagged && laterUsed && (
            <span className={styles.note}>
              <FiInfo /> Laptop later used by {v.laterUsedBy[0].name || "another student"}
              {v.laterUsedBy.length > 1 ? ` +${v.laterUsedBy.length - 1}` : ""}
            </span>
          )}
        </span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
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
          {v.selfieUrl ? (
            <a href={v.selfieUrl} target="_blank" rel="noreferrer" className={styles.bigLink}>
              <SelfieImage v={v} className={styles.big} />
            </a>
          ) : (
            <SelfieImage v={v} className={styles.big} />
          )}
          {v.selfieDeleted && (
            <p className={styles.muted}>Selfies are deleted on the 5th of the following month.</p>
          )}

          {flagged && (
            <div className={`${styles.banner} ${styles.bannerWarn}`}>
              <FiAlertTriangle />
              <div>
                <strong>Checked in from a laptop another student already used today</strong>
                <ul>
                  {v.sharedWith.map((s) => (
                    <li key={String(s.attendanceId)}>
                      {s.name || "Unknown"}
                      {s.studentId ? ` (${s.studentId})` : ""}
                      {s.inTime ? ` at ${formatTime(s.inTime)}` : ""}: {MATCHED_BY[s.matchedBy] || s.matchedBy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {laterUsed && (
            <div className={`${styles.banner} ${styles.bannerInfo}`}>
              <FiInfo />
              <div>
                <strong>Other students checked in later from this laptop</strong>
                <ul>
                  {v.laterUsedBy.map((s) => (
                    <li key={String(s.attendanceId)}>
                      {s.name || "Unknown"}
                      {s.studentId ? ` (${s.studentId})` : ""}
                      {s.inTime ? ` at ${formatTime(s.inTime)}` : ""}: {MATCHED_BY[s.matchedBy] || s.matchedBy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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

            <dt>IP address</dt>
            <dd>{v.ip || "-"}</dd>

            <dt>Browser ID</dt>
            <dd className={styles.mono} title={v.deviceId}>
              {shortId(v.deviceId)}
            </dd>

            <dt>Laptop fingerprint</dt>
            <dd className={styles.mono} title={v.fingerprint || ""}>
              {shortId(v.fingerprint)}
            </dd>

            <dt>Browser</dt>
            <dd className={styles.ua}>{v.userAgent || "-"}</dd>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckInVerification;
