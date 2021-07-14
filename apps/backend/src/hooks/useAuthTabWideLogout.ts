import { useHistory } from "react-router-dom";

type TypeLoginStatus = "logged-in" | "logged-out";

export const STORAGE_ITEM_NAME = "loginStatus";

let status: TypeLoginStatus = "logged-out";

let eventAttached = false;

export const useAuthTabWideLogout = () => {
  const history = useHistory();
  
  if (typeof window !== "undefined" && !eventAttached) {
    eventAttached = true;
    
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_ITEM_NAME) {
        if (event.newValue === "logged-out") {
          document.location.reload();
        } else {
          history.push('/');
        }
      }
    });
  }

  const setAccessInfo = (loginStatus: TypeLoginStatus) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("loginStatus", loginStatus);
    }
  };

  return [status, setAccessInfo] as const;
};

export default useAuthTabWideLogout;
