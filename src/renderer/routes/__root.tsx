import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

const RootRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeLogin = window.electronAPI.onLoginNeeded(() => {
      navigate({
        to: "/login",
      });
    });

    const unsubscribeOnboarding = window.electronAPI.onOnboardingNeeded(
      () => {
        navigate({
          to: "/onboarding",
        });
      },
    );

    return () => {
      unsubscribeLogin();
      unsubscribeOnboarding();
    };
  }, [navigate]);

  return (
    <>
      <Outlet />
    </>
  );
};

export const Route = createRootRoute({ component: RootRoute });
