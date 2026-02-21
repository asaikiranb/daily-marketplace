'use client';

import { useState } from 'react';

export default function ProfileEditor({ editForm, onFormChange, onSave, onCancel }) {
    return (
        <form onSubmit={onSave}>
            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => onFormChange({ ...editForm, full_name: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <label>About Me</label>
                <textarea
                    value={editForm.about_me}
                    onChange={(e) => onFormChange({ ...editForm, about_me: e.target.value })}
                    placeholder="Tell the community about yourself..."
                />
            </div>
            <div className="form-group">
                <label>Contact Info</label>
                <input
                    type="text"
                    value={editForm.contact_info}
                    onChange={(e) => onFormChange({ ...editForm, contact_info: e.target.value })}
                    placeholder="Phone, Discord, etc."
                />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}
