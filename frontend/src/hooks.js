import { useEffect, useRef } from "react";

export function useScrollTo(trigger) {
  const ref = useRef(null);
  useEffect(() => {
    if (trigger && ref.current) ref.current.scrollIntoView({ behavior: "smooth" });
  }, [trigger]);
  return ref;
}
