/**
 * SubmitReportModal.jsx
 * Modal form that lets a farmer share the price they saw at the market.
 *
 * UX/UI Refactor Notes (Hackathon PR):
 *   - Title changed: "Submit Mandi Price Report" → "Share Today's Crop Price"
 *   - Subtitle is now one short, friendly sentence
 *   - All field labels use conversational question forms (e.g. "What crop did you sell?")
 *   - Grade options simplified: "Premium / Export quality" → "Very good quality"
 *   - CTA "Save Report" → "Share Information"
 *   - Location placeholder removes technical acronym "APMC"
 *
 * Accessibility (unchanged from original):
 *   - role="dialog" + aria-modal + aria-labelledby
 *   - Focus trap: Tab / Shift+Tab cycles within the modal
 *   - Escape key closes the modal
 *   - Inline validation with aria-describedby error messages
 *   - Required fields announced with aria-required
 *
 * Props:
 *   @param {boolean}  isOpen       — Controls visibility
 *   @param {Function} onClose      — Called when modal should close
 *   @param {Function} onSubmit     — Called with (formData: object) on valid submit
 *   @param {boolean}  isSubmitting — Disables the submit button during the API call
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

/* ── Validation ──────────────────────────────────────────────────────────── */
function validate(form) {
  const errors = { item: '', price: '', location: '' };
  let isValid = true;

  // UX Change: Validation messages are plain — "Crop name is required" instead of "Commodity name"
  if (!form.item.trim()) {
    errors.item = 'Please enter the crop name.';
    isValid = false;
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    errors.price = 'Please enter the price (must be more than 0).';
    isValid = false;
  }
  if (!form.location.trim()) {
    errors.location = 'Please enter the market or location name.';
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
          {/* UX Change: Title changed from "Submit Mandi Price Report" → "Share Today's Crop Price" */}
          <h2 className="community-int__modal-title" id="modal-title">
            <Megaphone size={18} color="var(--accent-cyan)" aria-hidden="true" />
            Share Today's Crop Price
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px' }}
          >
            <X size={20} />
          </button>
        </div>
        {/* UX Change: Subtitle shortened to one friendly sentence — no jargon */}
        <p id="modal-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-10px' }}>
          Help other farmers by sharing what price you saw today.
          Fields marked <span aria-hidden="true" style={{ color: 'var(--ci-trend-down)' }}>*</span> are required.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Crop Name ── */}
          {/* UX Change: Label changed from "Crop / Commodity Name" → conversational "What crop did you sell?" */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-item">
              What crop did you sell?
              <span aria-label="required" style={{ color: 'var(--ci-trend-down)', marginLeft: '2px' }}>*</span>
            </label>
            <input
              id="modal-item"
              name="item"
              type="text"
              className={`community-int__input ${errors.item ? 'community-int__input--error' : ''}`}
              placeholder="e.g. Tomato, Onion, Wheat"
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

          {/* ── Type of Crop ── */}
          {/* UX Change: Label changed from "Category" → "Type of Crop" (plain English) */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-category">Type of Crop</label>
            <select
              id="modal-category"
              name="category"
              className="community-int__select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Choose a type</option>
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
          {/* UX Change: "Price (₹)" → "Price you got (₹)", "Unit" → "Sold per" */}
          <div className="community-int__field">
            <div className="community-int__input-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <label className="community-int__label" htmlFor="modal-price">
                  Price you got (₹)
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
                <label className="community-int__label" htmlFor="modal-unit">Sold per</label>
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

          {/* ── Crop Condition (Quality Grade) ── */}
          {/* UX Change: "Quality Grade" → "Crop Condition"; removed export/import jargon from options */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-grade">Crop Condition</label>
            <select
              id="modal-grade"
              name="qualityGrade"
              className="community-int__select"
              value={form.qualityGrade}
              onChange={handleChange}
            >
              <option value="A">Grade A — Very good quality</option>
              <option value="B">Grade B — Normal quality</option>
              <option value="C">Grade C — Below normal / home use</option>
            </select>
          </div>

          {/* ── Location (Market / Mandi) ── */}
          {/* UX Change: "Mandi / Location" → question form "Where did you sell?" */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-location">
              Where did you sell?
              <span aria-label="required" style={{ color: 'var(--ci-trend-down)', marginLeft: '2px' }}>*</span>
            </label>
            <input
              id="modal-location"
              name="location"
              type="text"
              className={`community-int__input ${errors.location ? 'community-int__input--error' : ''}`}
              placeholder="e.g. Azamgarh Market, Varanasi"
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

          {/* ── Your Name (optional) ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-reporter">
              Your Name <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span>
            </label>
            {/* UX Change: Removed "(Farmer)" tag from placeholder — redundant for a farmer app */}
            <input
              id="modal-reporter"
              name="reporter"
              type="text"
              className="community-int__input"
              placeholder="e.g. Ramesh Kumar"
              value={form.reporter}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* ── Form Actions ── */}
          {/* UX Change: "Cancel" kept plain; submit button text changed to "Share Information" */}
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
                  Sharing…
                </>
              ) : (
                <>
                  <Send size={14} aria-hidden="true" /> Share Information
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
