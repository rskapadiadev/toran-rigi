// Couple and family photos for one invitation, kept in blob storage under the invitation's prefix.
import { newId } from '@shared/ids';
import { photoExtension, type PhotoMime, photoPrefix } from '@shared/photos';

import { getPlatform } from '../platform/context';

export async function storePhoto(invitationId: string, mime: PhotoMime, body: ArrayBuffer) {
    const { blob } = getPlatform();
    const key = `${photoPrefix(invitationId)}${newId()}.${photoExtension(mime)}`;
    await blob.put(key, body, {
        contentType: mime,
        cacheControl: 'public, max-age=31536000, immutable',
    });
    return key;
}

// Only keys under this invitation's own prefix can be removed through it.
export async function deletePhoto(invitationId: string, key: string) {
    if (!key.startsWith(photoPrefix(invitationId)) || key.includes('..')) return false;
    await getPlatform().blob.delete(key);
    return true;
}
