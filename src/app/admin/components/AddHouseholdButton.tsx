'use client';

import { useState } from 'react';
import { AddHouseholdDrawer } from './AddHouseholdDrawer';

export function AddHouseholdButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
      >
        + New household
      </button>
      <AddHouseholdDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
