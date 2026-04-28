/**
 * MFA enforcement is currently disabled platform-wide.
 * Users can still optionally enroll/unenroll TOTP from Settings → Security,
 * but no role is forced to enroll and no AAL2 challenge blocks the dashboard.
 *
 * To re-enable enforcement later, restore the previous gate logic from git history.
 */
export default function MFAGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
