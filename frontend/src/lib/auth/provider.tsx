"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { DEFAULT_POST_SIGN_IN_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/config";

/**
 * App-wide auth provider. This is the ONLY place `ClerkProvider` itself
 * is referenced — `app/layout.tsx` imports `AuthProvider` from here, not
 * `ClerkProvider` from `@clerk/nextjs` directly. Swapping providers
 * later means rewriting the inside of this component (and the other
 * files in `lib/auth/`) to produce the same `AuthUser`/`AuthState`
 * contract; nothing in `app/` or `components/` needs to know.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInUrl={SIGN_IN_PATH}
      signUpUrl={SIGN_UP_PATH}
      signInFallbackRedirectUrl={DEFAULT_POST_SIGN_IN_PATH}
      signUpFallbackRedirectUrl={DEFAULT_POST_SIGN_IN_PATH}
      appearance={{
  variables: {
    colorPrimary: "#E10600",
    colorBackground: "#14171C",
    colorText: "#F5F6F7",
    colorTextSecondary: "#A1A8B3",
    colorInputBackground: "#1D2127",
    colorInputText: "#F5F6F7",
    colorNeutral: "#2A2E35",
    colorDanger: "#EF4444",
    borderRadius: "8px",
    fontFamily: "var(--font-body)",
  },

  elements: {
  card: "bg-[#181A20] border border-[#2B313A] shadow-2xl",

  modalContent: "bg-[#181A20]",

  headerTitle: "text-white",

  headerSubtitle: "text-gray-400",

  socialButtonsBlockButton:
    "bg-[#232730] border border-[#353B45] hover:bg-[#2D323C] transition-colors",

  socialButtonsBlockButtonText:
    "text-white font-medium",

  socialButtonsBlockButtonArrow:
    "text-gray-300",

  formFieldLabel:
    "text-gray-200",

  formFieldInput:
    "bg-[#232730] border border-[#353B45] text-white placeholder:text-gray-500",

  formButtonPrimary:
    "bg-[#E10600] hover:bg-[#C70500] text-white",

  footerActionText:
    "text-gray-400",

  footerActionLink:
    "text-red-500 hover:text-red-400",

  dividerLine:
    "bg-[#353B45]",

  dividerText:
    "text-gray-500",

  userButtonPopoverCard:
    "bg-[#181A20] border border-[#2B313A]",

  userButtonPopoverActionButton:
    "text-white hover:bg-[#2D323C]",

  userButtonPopoverActionButtonText:
    "text-white",

  userButtonPopoverActionButtonIcon:
    "text-gray-300",

  userPreviewMainIdentifier:
    "text-white",

  userPreviewSecondaryIdentifier:
    "text-gray-400",
},
}}
    >
      {children}
    </ClerkProvider>
  );
}
