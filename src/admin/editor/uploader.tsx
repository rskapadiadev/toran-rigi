// Where picked photos go. The studio editor uploads to the invitation; the customer shop swaps in
// its own (browser-only while trying, the customer's endpoint after buying) and hides stock search.
import { createContext, use } from 'react';

export interface Uploader {
    upload: (file: File) => Promise<string>;
    stock: boolean;
}

export const UploaderContext = createContext<Uploader | null>(null);

export const useUploader = () => use(UploaderContext);
