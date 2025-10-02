"use client";

import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export default function PrivateData() {
  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <>
      <p>Welcome {privateData.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
    </>
  );
}
