// Opens the film editor in the middle of the studio editor, from a panel (e.g. on a line of words).
import { createContext, use } from 'react';

export const FilmEditorContext = createContext<((word?: number) => void) | null>(null);
export const useOpenFilmEditor = () => use(FilmEditorContext);
