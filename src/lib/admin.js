import { normalizeUsername } from '@/lib/orders';

function clampUsername(value) {
  const cleaned = normalizeUsername(value).replace(/[^a-z0-9._-]/g, '').slice(0, 32);

  if (cleaned.length >= 3) {
    return cleaned;
  }

  return '';
}

export function getSuggestedAdminUsername(user, fallback = '') {
  const candidates = [
    fallback,
    user?.user_metadata?.username,
    user?.email?.split('@')?.[0],
    user?.id ? `admin${String(user.id).replace(/-/g, '').slice(0, 8)}` : '',
  ];

  for (const candidate of candidates) {
    const normalized = clampUsername(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return 'admin001';
}

export function getSuggestedAdminDisplayName(user, fallback = '') {
  const candidates = [
    fallback,
    user?.user_metadata?.display_name,
    user?.user_metadata?.name,
    'Admin',
  ];

  return candidates.find((candidate) => String(candidate || '').trim())?.trim() || 'Admin';
}
