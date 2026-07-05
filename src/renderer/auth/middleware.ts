import { redirect } from "@tanstack/react-router";

export const authMiddleware = async () => {
  if (!(await window.electronAPI.userAuthenticated())) {
    throw redirect({
      to: "/login",
    });
  }
};

export const loginMiddleware = async () => {
  if (!(await window.electronAPI.onboardingCompleted())) {
    throw redirect({
      to: "/onboarding",
    });
  }
};

export const onboardingMiddleware = async () => {
  if (await window.electronAPI.onboardingCompleted()) {
    throw redirect({
      to: "/login",
    });
  }
};
