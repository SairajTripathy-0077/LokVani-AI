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
import { t } from './communityTranslations.js';

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
function validate(form, lang) {
  const errors = { item: '', price: '', location: '' };
  let isValid = true;

  if (!form.item.trim()) {
    errors.item = t('errorCropRequired', lang);
    isValid = false;
  }
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
    errors.price = t('errorPriceInvalid', lang);
    isValid = false;
  }
  if (!form.location.trim()) {
    errors.location = t('errorLocationRequired', lang);
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

export default function SubmitReportModal({ isOpen, onClose, onSubmit, isSubmitting = false, lang = 'en' }) {
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
    const { errors: newErrors, isValid } = validate(form, lang);
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
            {t('modalTitle', lang)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px' }}
          >
            <X size={20} />
          </button>
        </div>
        <p id="modal-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '-10px' }}>
          {t('modalSubtitle', lang)}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Crop Name ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-item">
              {t('cropNameLabel', lang)}
            </label>
            <input
              id="modal-item"
              name="item"
              type="text"
              className={`community-int__input ${errors.item ? 'community-int__input--error' : ''}`}
              placeholder={t('cropNamePlaceholder', lang)}
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
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-category">{t('categoryLabel', lang)}</label>
            <select
              id="modal-category"
              name="category"
              className="community-int__select"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">{t('categoryDefault', lang)}</option>
              <option value="Vegetable">{t('filterVegetable', lang)}</option>
              <option value="Grain">{t('filterGrain', lang)}</option>
              <option value="Pulse">{t('filterPulse', lang)}</option>
              <option value="Spice">{t('filterSpice', lang)}</option>
              <option value="Fruit">{t('filterFruit', lang)}</option>
              <option value="Oilseed">{t('filterOilseed', lang)}</option>
              <option value="Other">{t('filterOther', lang)}</option>
            </select>
          </div>

          {/* ── Price + Unit (side by side) ── */}
          <div className="community-int__field">
            <div className="community-int__input-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div>
                <label className="community-int__label" htmlFor="modal-price">
                  {t('priceLabel', lang)}
                </label>
                <input
                  id="modal-price"
                  name="price"
                  type="number"
                  min="1"
                  step="0.5"
                  className={`community-int__input ${errors.price ? 'community-int__input--error' : ''}`}
                  placeholder={lang === 'hi' ? 'जैसे: 28' : 'e.g. 28'}
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
                <label className="community-int__label" htmlFor="modal-unit">{t('unitLabel', lang)}</label>
                <select
                  id="modal-unit"
                  name="unit"
                  className="community-int__select"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="quintal">{lang === 'hi' ? 'क्विंटल' : 'quintal'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Crop Condition (Quality Grade) ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-grade">{t('gradeLabel', lang)}</label>
            <select
              id="modal-grade"
              name="qualityGrade"
              className="community-int__select"
              value={form.qualityGrade}
              onChange={handleChange}
            >
              <option value="A">{t('gradeA', lang)}</option>
              <option value="B">{t('gradeB', lang)}</option>
              <option value="C">{t('gradeC', lang)}</option>
            </select>
          </div>

          {/* ── Location (Market / Mandi) ── */}
          <div className="community-int__field">
            <label className="community-int__label" htmlFor="modal-location">
              {t('mandiLabel', lang)}
            </label>
            <input
              id="modal-location"
              name="location"
              type="text"
              className={`community-int__input ${errors.location ? 'community-int__input--error' : ''}`}
              placeholder={t('mandiPlaceholder', lang)}
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
              {t('reporterLabel', lang)}
            </label>
            <input
              id="modal-reporter"
              name="reporter"
              type="text"
              className="community-int__input"
              placeholder={t('reporterPlaceholder', lang)}
              value={form.reporter}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* ── Form Actions ── */}
          <div className="community-int__modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              {t('cancelBtn', lang)}
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
                  {t('savingBtn', lang)}
                </>
              ) : (
                <>
                  <Send size={14} aria-hidden="true" /> {t('saveReportBtn', lang)}
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
