import type { MessageStatus } from '../types';

interface MessageStatusProps {
  status: MessageStatus;
  /** Show as small inline icons */
  size?: 'sm' | 'xs';
}

/**
 * MessageStatus — renders tick icons based on message status:
 *   sending   → clock icon (gray)
 *   sent      → single tick (gray)
 *   delivered → double tick (gray)
 *   read      → double tick (blue)
 *   failed    → exclamation (red)
 */
export default function MessageStatus({ status, size = 'xs' }: MessageStatusProps) {
  const dim = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (status === 'sending') {
    return (
      <svg className={`${dim} text-indigo-200 inline`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  if (status === 'failed') {
    return (
      <svg className={`${dim} text-red-400 inline`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }

  if (status === 'sent') {
    // Single tick
    return (
      <svg className={`${dim} text-indigo-200 inline`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd" />
      </svg>
    );
  }

  if (status === 'delivered') {
    // Double tick gray
    return (
      <span className="inline-flex items-center -space-x-1">
        <svg className={`${dim} text-gray-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd" />
        </svg>
        <svg className={`${dim} text-gray-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd" />
        </svg>
      </span>
    );
  }

  if (status === 'read') {
    // Double tick blue
    return (
      <span className="inline-flex items-center -space-x-1">
        <svg className={`${dim} text-blue-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd" />
        </svg>
        <svg className={`${dim} text-blue-400`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd" />
        </svg>
      </span>
    );
  }

  return null;
}
