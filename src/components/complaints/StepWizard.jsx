import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UrgencyDot } from '../common/UrgencyDot';

export function StepWizard({ onComplete }) {
  const { addComplaint } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'Facilities',
    urgency: 'Medium',
    title: '',
    location: '',
    description: '',
    photo: null, // base64 data URL
    photoName: '',
    photoSize: ''
  });

  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState('');

  const categories = [
    'Facilities',
    'IT',
    'Library',
    'Catering',
    'Welfare',
    'Academic',
    'Transport'
  ];

  const urgencyOptions = [
    {
      level: 'Low',
      caption: 'Minor cosmetic or non-critical issue. No impact on study.',
      dotClass: 'dot-low'
    },
    {
      level: 'Medium',
      caption: 'Inconvenience affecting daily schedule. Normal SLA (48 hrs).',
      dotClass: 'dot-medium'
    },
    {
      level: 'High',
      caption: 'Substantially disrupts learning, lecture access, or coursework.',
      dotClass: 'dot-high'
    },
    {
      level: 'Critical',
      caption: 'Immediate health, physical safety, or facility emergency.',
      dotClass: 'dot-critical'
    }
  ];

  const handleNextFromStep1 = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleFileChange = (e) => {
    setPhotoError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validation: Image files only
    if (!file.type.startsWith('image/')) {
      setPhotoError('Invalid file type. Please upload an image file (JPG, PNG, WebP).');
      e.target.value = '';
      return;
    }

    // Validation: 5MB size limit
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPhotoError('File size exceeds the 5MB limit. Please select a smaller photo.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        photo: event.target.result,
        photoName: file.name,
        photoSize: `${(file.size / 1024).toFixed(1)} KB`
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoName: '',
      photoSize: ''
    }));
    setPhotoError('');
    const fileInput = document.getElementById('complaint-photo-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleNextFromStep2 = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    }
    if (!formData.location.trim()) {
      errs.location = 'Specific location is required';
    }
    if (!formData.description.trim()) {
      errs.description = 'Detailed description is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addComplaint({
      title: formData.title,
      category: formData.category,
      urgency: formData.urgency,
      location: formData.location,
      description: formData.description,
      photo: formData.photo
    });
    if (onComplete) onComplete();
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* 3-Step Progress Indicator */}
      <div className="step-indicator" aria-label="Complaint submission progress">
        <div className="step-item">
          <div className={`step-circle ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className="step-label">Category & Urgency</span>
        </div>

        <div className={`step-line ${currentStep >= 2 ? 'active' : ''}`} />

        <div className="step-item">
          <div className={`step-circle ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <span className="step-label">Details</span>
        </div>

        <div className={`step-line ${currentStep >= 3 ? 'active' : ''}`} />

        <div className="step-item">
          <div className={`step-circle ${currentStep === 3 ? 'active' : ''}`}>
            3
          </div>
          <span className="step-label">Review & Submit</span>
        </div>
      </div>

      <div style={{ marginTop: '54px' }}>
        {/* STEP 1: Category & Urgency */}
        {currentStep === 1 && (
          <form onSubmit={handleNextFromStep1} className="card">
            <h2 className="heading-serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Step 1: Category & Urgency Level
            </h2>
            <p style={{ fontSize: '13px', marginBottom: '24px' }}>
              Select the appropriate department domain and urgency level to ensure proper routing.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="complaint-category-select">
                Campus Department / Category
              </label>
              <select
                id="complaint-category-select"
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Urgency Level
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  marginTop: '8px'
                }}
              >
                {urgencyOptions.map((opt) => {
                  const isSelected = formData.urgency === opt.level;
                  return (
                    <div
                      key={opt.level}
                      onClick={() => setFormData({ ...formData, urgency: opt.level })}
                      style={{
                        padding: '16px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        border: isSelected
                          ? '1.5px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          setFormData({ ...formData, urgency: opt.level });
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className={`dot ${opt.dotClass}`} aria-hidden="true" />
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {opt.level}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {opt.caption}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button type="submit" id="step1-next-btn" className="btn-primary">
                Proceed to Details ›
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Details */}
        {currentStep === 2 && (
          <form onSubmit={handleNextFromStep2} className="card">
            <h2 className="heading-serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Step 2: Complaint Details & Location
            </h2>
            <p style={{ fontSize: '13px', marginBottom: '24px' }}>
              Be as specific as possible so the assigned department can resolve the problem without delays.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="complaint-title-input">
                Complaint Title *
              </label>
              <input
                id="complaint-title-input"
                type="text"
                className="form-input"
                placeholder="e.g. Broken projector in Room 204"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && (
                <div style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.title}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="complaint-location-input">
                Specific Location *
              </label>
              <input
                id="complaint-location-input"
                type="text"
                className="form-input"
                placeholder="e.g. Science Block B, Room 204, 2nd floor"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              {errors.location && (
                <div style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.location}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="complaint-description-input">
                Detailed Description *
              </label>
              <textarea
                id="complaint-description-input"
                rows={4}
                className="form-textarea"
                placeholder="Describe what is broken, what happened, and any safety concerns..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && (
                <div style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.description}
                </div>
              )}
            </div>

            {/* Real Photo Attachment Control */}
            <div className="form-group">
              <label className="form-label">
                Photo Evidence (Optional)
              </label>

              <input
                type="file"
                id="complaint-photo-file-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {!formData.photo ? (
                <div>
                  <label
                    htmlFor="complaint-photo-file-input"
                    className="btn-secondary"
                    style={{ display: 'inline-flex', cursor: 'pointer', padding: '9px 16px', fontSize: '13px' }}
                  >
                    Attach Photo
                  </label>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                    JPG, PNG, WebP up to 5MB
                  </span>
                </div>
              ) : (
                /* Thumbnail preview with Remove option */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={formData.photo}
                      alt="Thumbnail preview"
                      style={{
                        width: '56px',
                        height: '56px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {formData.photoName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formData.photoSize}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-text btn-text-danger"
                    onClick={handleRemovePhoto}
                    style={{ fontSize: '12px' }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {photoError && (
                <div style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '6px' }}>
                  {photoError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(1)}
              >
                ‹ Back
              </button>
              <button type="submit" id="step2-next-btn" className="btn-primary">
                Review Summary ›
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Review & Submit */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="heading-serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Step 3: Review & Submit
            </h2>
            <p style={{ fontSize: '13px', marginBottom: '24px' }}>
              Please confirm the details below before submitting your ticket.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '28px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Title
                </span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formData.title}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Category
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <span className="badge-pill">{formData.category}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Urgency Level
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    <UrgencyDot urgency={formData.urgency} />
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Location
                </span>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formData.location}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Description
                </span>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                  {formData.description}
                </div>
              </div>

              {/* Photo Evidence in Review Step */}
              {formData.photo && (
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Attached Photo Evidence
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <img
                      src={formData.photo}
                      alt="Attachment preview"
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {formData.photoName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formData.photoSize}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentStep(2)}
              >
                ‹ Edit Details
              </button>
              <button type="submit" id="submit-complaint-btn" className="btn-primary">
                Submit Complaint to CamCare
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default StepWizard;
