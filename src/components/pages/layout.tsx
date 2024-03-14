export default function Layout({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <div>{children}</div>;
}
