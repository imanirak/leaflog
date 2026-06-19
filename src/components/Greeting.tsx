"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name }: { name: string | null }) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="mb-1 text-sm" style={{ color: "#8a8070" }}>
      {greeting}{name ? `, ${name}` : ""}
    </div>
  );
}
