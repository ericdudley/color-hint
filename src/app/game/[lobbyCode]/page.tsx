"use client";

import dynamic from "next/dynamic";

const DynamicGamePage = dynamic(() => import("@/components/pages/game-page"), {
  ssr: false,
});

export default function Page(props: {
  params: {
    lobbyCode: string;
  };
}) {
  return <DynamicGamePage lobbyCode={props.params.lobbyCode} />;
}
