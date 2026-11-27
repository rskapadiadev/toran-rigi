import type { Brief, MyMadeView } from '@shared/schemas/made';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, post, upload } from '@/lib/api';

export const madeKey = (id: string) => ['made', id] as const;

export const useMade = (id: string) =>
    useQuery({
        queryKey: madeKey(id),
        queryFn: () => api<MyMadeView>(`/store/me/invitations/${id}/made`),
    });

// Every answer is the page's new state; the list and editor hear of it too.
export function useMadeAction<T>(id: string, run: (root: string, input: T) => Promise<MyMadeView>) {
    const client = useQueryClient();
    return useMutation({
        mutationFn: (input: T) => run(`/store/me/invitations/${id}/made`, input),
        onSuccess: async (view) => {
            client.setQueryData(madeKey(id), view);
            await client.invalidateQueries({ queryKey: ['me'] });
        },
    });
}

export const saveBrief = (root: string, brief: Brief) =>
    api<MyMadeView>(root, {
        method: 'PUT',
        body: JSON.stringify(brief),
    });

export const sendBrief = async (root: string, brief: Brief) => {
    await saveBrief(root, brief);
    return post<MyMadeView>(`${root}/send`, {});
};

export const askChanges = (root: string, text: string) =>
    post<MyMadeView>(`${root}/changes`, { text });

export const addFile = (root: string, file: File) => {
    const form = new FormData();
    form.append('file', file, file.name);
    return upload<MyMadeView>(`${root}/files`, form);
};

export const removeFile = (root: string, fileId: string) =>
    api<MyMadeView>(`${root}/files/${fileId}`, { method: 'DELETE' });
