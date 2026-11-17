import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FiCrosshair, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";
import { updateCampusSettingsApi } from "../../api/Serviceapi";
import styles from "./CampusSettingsDialog.module.css";

// Campus point + radius for the student check-in geofence. Best set by
// pressing "Use my current location" while standing on campus with a
// laptop - it then matches what students' laptops report.

const toForm = (campus) => ({
  latitude: campus?.latitude ?? "",
  longitude: campus?.longitude ?? "",
  radius: campus?.radius ?? 200,
  accuracyLimit: campus?.accuracyLimit ?? 300,
});

const CampusSettingsDialog = ({ open, onClose, campus, onSaved }) => {
  const [form, setForm] = useState(toForm(campus));
  const [locating, setLocating] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toForm(campus));
      setLastAccuracy(null);
    }
  }, [open, campus]);

  const limits = campus?.limits || { radius: { min: 50, max: 5000 }, accuracyLimit: { min: 20, max: 5000 } };
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const hasPoint = form.latitude !== "" && form.longitude !== "";

  const fillCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("This browser does not support location");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLastAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === 1
            ? "Location access is blocked for this site. Allow it in the address bar and try again."
            : "Could not get your location. Turn on Wi-Fi and location services, then try again."
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateCampusSettingsApi({
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius: Number(form.radius),
        accuracyLimit: Number(form.accuracyLimit),
      });
      toast.success("Campus location saved");
      onSaved?.(res?.data?.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save campus location");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.title}>
        <span>
          Check-in campus location
          <small>Students can only check in within the radius of this point.</small>
        </span>
        <IconButton onClick={onClose} size="small" aria-label="Close" disabled={saving}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <button type="button" className={styles.locateBtn} onClick={fillCurrentLocation} disabled={locating}>
          <FiCrosshair /> {locating ? "Getting your location..." : "Use my current location"}
        </button>
        <p className={styles.help}>
          Press this while you are on campus, on a laptop with Wi-Fi on. Or paste the coordinates from Google Maps
          (right-click the building, then click the numbers to copy them).
        </p>
        {lastAccuracy !== null && (
          <p className={lastAccuracy > 100 ? styles.warn : styles.good}>
            Your location was found within ±{lastAccuracy} m.
            {lastAccuracy > 100 && " That's not very precise; try again near a window or with Wi-Fi on."}
          </p>
        )}

        <div className={styles.grid}>
          <TextField label="Latitude" size="small" value={form.latitude} onChange={set("latitude")} type="number" />
          <TextField label="Longitude" size="small" value={form.longitude} onChange={set("longitude")} type="number" />
          <TextField
            label="Allowed radius (metres)"
            size="small"
            value={form.radius}
            onChange={set("radius")}
            type="number"
            helperText={`How far from the point a student may be (${limits.radius.min}-${limits.radius.max})`}
          />
          <TextField
            label="Accuracy limit (metres)"
            size="small"
            value={form.accuracyLimit}
            onChange={set("accuracyLimit")}
            type="number"
            helperText={`Reject locations less precise than this (${limits.accuracyLimit.min}-${limits.accuracyLimit.max})`}
          />
        </div>

        {hasPoint && (
          <a
            className={styles.mapLink}
            href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            <FiMapPin /> Check this point on Google Maps
          </a>
        )}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onClose} disabled={saving}>
          Cancel
        </button>
        <button type="button" className={styles.save} onClick={save} disabled={saving || !hasPoint}>
          {saving ? "Saving..." : "Save"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CampusSettingsDialog;
