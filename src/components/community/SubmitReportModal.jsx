/**
 * SubmitReportModal.jsx
 * Accessible modal for submitting a new community mandi price report.
 *
 * Accessibility implementation:
 *  - role="dialog" + aria-modal="true" + aria-labelledby
 *  - Focus trap: Tab/Shift+Tab cycles only within the modal
 *  - Escape key closes the modal
 *  - Inline field-level validation with aria-describedby error messages
 *  - Required fields announced with aria-required
 *
 * Extended fields over the original CommunityIntel form:
 *  - category (Vegetable / Grain / Spice / Fruit / Other)
 *  - qualityGrade (A / B / C)
 *
 * Props:
 *   @param {boolean}  isOpen      — Controls visibility
 *   @param {Function} onClose     — Called when modal should close
 *   @param {Function} onSubmit    — Called with (formData: object) on valid submit
 *   @param {boolean}  isSubmitting — Disables the submit button during the API call
 *
 * Commit: feat(community): add accessible SubmitReportModal with validation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Megaphone, X, Send, AlertCircle } from 'lucide-react';

/* ── Initial Form State ───────────────────────────────────────────────────── */
const INITIAL_FORM = {
  item:         '',
  price:        '',
  unit:         'kg',
  location:     '',
  reporter:     '',
  category:     '',
  qualityGrade: 'A',
};

const INITIAL_ERRORS = {
  item: '',
  price: '',
  location: '',
};

/* ── Validation ───────────────────────────────────────────────────────────── */
function validate(form) {
  const errors = { item: '', price: '', location: '' };
  let isValid = true;

  if (!form.item.trim()) {
    errors.item = 'Commodity name is required.';
    isValid = false;
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    errors.price = 'Enter a valid price greater than zero.';
    isValid = false;
  }
  if (!form.location.trim()) {
    errors.location = 'Mandi / location is required.';
    isValid = false;
  }

  return { errors, isValid };
}

/* ── Focus Trap Hook ──────────────────────────────────────────────────────── */
function useFocusTrap(isOpen, containerRef) {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusable = Array.from(containerRef.current.querySelectorAll(focusableSelectors));
    const firstEl = focusable[0];
    const lastEl  = focusable[focusable.length - 1];

    // Focus the first element when modal opens
    firstEl?.focus();

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    }

    containerRef.current.addEventListener('keydown', handleTab);
    return () => containerRef.current?.removeEventListener('keydown', handleTab);
  }, [isOpen, containerRef]);
}

export default function SubmitReportModal({ isOpen, onClose, onSubmit, isSubmitting = false }) {
  const [form, setForm]     = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const containerRef        = useRef(null);

  // Focus trap
  useFocusTrap(isOpen, containerRef);

  // Escape key → close
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll while modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ── Field change handler ── */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  /* ── Submit handler ── */
  function handleSubmit(e) {
    e.preventDefault();
    const { errors: newErrors, isValid } = validate(form);
    setErrors(newErrors);
    if (!isValid) return;

    onSubmit({
      item:         form.item.trim(),
      price:        Number(form.price),
      unit:         form.unit,
      location:     form.location.trim(),
      reportedBy:   form.reporter.trim() || 'Local Farmer',
      category:     form.category || 'Other',
      qualityGrade: form.qualityGrade,
    });
  }

  return (
    /* Backdrop — click outside to close */
    <div
      className="community-int__backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/*
        dialog role with aria-modal prevents assistive technology from
        reading content outside this modal while it is open.
      */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className="community-int__modal"
      >
        {/* ── Modal Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 className="community-int__modal-title" id="modal-title">
            <Megaphone size={18} color="var(--accent-cyan)" aria-hidden="true" />
            Submit Mandi Price Report
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px' }}
          >
            <X size={20} />
          </button>
        </div>
        <p id="modal-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-10px' }}>
          Report local mandi rates to help fellow farmers make better decisions.
          Fields marked <span aria-hidden="true" style={{ color: 'var(--ci-trend-down)' }}>*</span> are required.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Commodity Name ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-item">
              Crop / Commodity Name
              <span aria-label="required" style={{ color: 'var(--ci-trend-down)', marginLeft: '2px' }}>*</span>
            </label>
            <input
              id="modal-item"
              name="item"
              type="text"
              className={`community-int__input ${errors.item ? 'community-int__input--error' : ''}`}
              placeholder="e.g. Tamatar, Pyaaz, Gehun"
              value={form.item}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.item ? 'error-item' : undefined}
              aria-invalid={!!errors.item}
              autoComplete="off"
            />
            {errors.item && (
              <p className="community-int__field-error" id="error-item" role="alert">
                <AlertCircle size={12} aria-hidden="true" /> {errors.item}
              </p>
            )}
          </div>

          {/* ── Category ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-category">Category</label>
            <select
              id="modal-category"
              name="category"
              className="community-int__select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Grain">Grain / Cereal</option>
              <option value="Pulse">Pulse / Dal</option>
              <option value="Spice">Spice</option>
              <option value="Fruit">Fruit</option>
              <option value="Oilseed">Oilseed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ── Price + Unit (side by side) ── */}
          <div className="community-int__field">
            <div className="community-int__input-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <label className="community-int__label" htmlFor="modal-price">
                  Price (₹)
                  <span aria-label="required" style={{ color: 'var(--ci-trend-down)', marginLeft: '2px' }}>*</span>
                </label>
                <input
                  id="modal-price"
                  name="price"
                  type="number"
                  min="1"
                  step="0.5"
                  className={`community-int__input ${errors.price ? 'community-int__input--error' : ''}`}
                  placeholder="e.g. 28"
                  value={form.price}
                  onChange={handleChange}
                  aria-required="true"
                  aria-describedby={errors.price ? 'error-price' : undefined}
                  aria-invalid={!!errors.price}
                />
                {errors.price && (
                  <p className="community-int__field-error" id="error-price" role="alert">
                    <AlertCircle size={12} aria-hidden="true" /> {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label className="community-int__label" htmlFor="modal-unit">Unit</label>
                <select
                  id="modal-unit"
                  name="unit"
                  className="community-int__select"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Quality Grade ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-grade">Quality Grade</label>
            <select
              id="modal-grade"
              name="qualityGrade"
              className="community-int__select"
              value={form.qualityGrade}
              onChange={handleChange}
            >
              <option value="A">Grade A — Premium / Export quality</option>
              <option value="B">Grade B — Standard market quality</option>
              <option value="C">Grade C — Below standard / local use</option>
            </select>
          </div>

          {/* ── Mandi / Location ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-location">
              Mandi / Location
              <span aria-label="required" style={{ color: 'var(--ci-trend-down)', marginLeft: '2px' }}>*</span>
            </label>
            <input
              id="modal-location"
              name="location"
              type="text"
              className={`community-int__input ${errors.location ? 'community-int__input--error' : ''}`}
              placeholder="e.g. Azamgarh Mandi, Varanasi APMC"
              value={form.location}
              onChange={handleChange}
              aria-required="true"
              aria-describedby={errors.location ? 'error-location' : undefined}
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="community-int__field-error" id="error-location" role="alert">
                <AlertCircle size={12} aria-hidden="true" /> {errors.location}
              </p>
            )}
          </div>

          {/* ── Reporter Name (optional) ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-reporter">
              Your Name <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="modal-reporter"
              name="reporter"
              type="text"
              className="community-int__input"
              placeholder="e.g. Ramesh Kumar (Farmer)"
              value={form.reporter}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* ── Actions ── */}
          <div className="community-int__modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span aria-hidden="true" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'ci-spin 0.6s linear infinite' }} />
                  Saving…
                </>
              ) : (
                <>
                  <Send size={14} aria-hidden="true" /> Save Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Spinner keyframe — inlined to avoid global pollution */}
      <style>{`@keyframes ci-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
