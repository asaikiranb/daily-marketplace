'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AvatarUpload({ userId, photoUrl, fullName, onPhotoUpdate }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const supabase = createClient();

    const initials = fullName
        ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
        : '?';

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            alert('Upload failed: ' + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const newUrl = urlData.publicUrl + '?t=' + Date.now();

        await supabase
            .from('profiles')
            .update({ photo_url: newUrl })
            .eq('id', userId);

        onPhotoUpdate(newUrl);
        setUploading(false);
    };

    return (
        <div
            className="profile-avatar-upload"
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload a profile photo"
        >
            {photoUrl ? (
                <img src={photoUrl} alt={fullName || 'Profile'} className="profile-avatar-img" />
            ) : (
                <div className="profile-avatar">{initials}</div>
            )}
            <div className="profile-avatar-overlay">
                {uploading ? (
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                ) : (
                    <span>📷</span>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
            />
        </div>
    );
}
