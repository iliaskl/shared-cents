// components/pages/profile/profileService.js

export async function fetchUserProfile() {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}