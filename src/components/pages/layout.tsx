export default function Layout({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <div data-theme="dark">{children}</div>;
}
