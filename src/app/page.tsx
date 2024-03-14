"use client";

import dynamic from "next/dynamic";

const DynamicHomePage = dynamic(() => import("@/components/pages/home-page"), {
  ssr: false,
});

export default function Page() {
  return <DynamicHomePage />;
}
