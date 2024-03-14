import { PropsWithChildren, ReactElement } from "react";
import Background from "./background";

export default function CenteredLayout({
  children,
}: PropsWithChildren<{}>): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <Background />

      <div className="z-10 flex flex-col gap-8">{children}</div>
    </main>
  );
}
