import { useState, useEffect } from "react";

export const useOnScreen = (ref: React.MutableRefObject<any>, rootMargin = "0px") => {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  const current = ref.current;
  useEffect(() => {
    const currentRef = current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (current) {
      observer.observe(current);
    }
    return () => {
      observer.unobserve(currentRef);
    };
  }, [current, rootMargin]); // Empty array ensures that effect is only run on mount and unmount
  return isIntersecting;
};
