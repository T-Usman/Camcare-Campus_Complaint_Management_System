import React from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { StepWizard } from '../../components/complaints/StepWizard';

export function SubmitComplaint() {
  const { navigateTo } = useApp();

  const handleComplete = () => {
    navigateTo('student-complaints');
  };

  return (
    <div>
      <Topbar
        title="Submit Complaint"
        subtitle="Report an issue on campus for swift triage and resolution."
      />

      <main className="page-body">
        <StepWizard onComplete={handleComplete} />
      </main>
    </div>
  );
}

export default SubmitComplaint;
