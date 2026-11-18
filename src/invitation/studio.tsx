import { createContext } from 'react';

// True inside the studio's previews (Library, visual editor), false on the guest's page: lets a
// piece show the studio what is missing instead of quietly falling back as it does for guests.
export const StudioPreviewContext = createContext(false);
