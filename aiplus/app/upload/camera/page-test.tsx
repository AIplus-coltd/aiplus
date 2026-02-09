"use client";

import { useState } from "react";

export default function CameraPage() {
  const [test, setTest] = useState(false);

  return (
    <div>
      <h1>Test Camera Page</h1>
      <button onClick={() => setTest(!test)}>Toggle: {test.toString()}</button>
    </div>
  );
}
