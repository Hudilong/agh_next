"use server";

import { normalizeLang } from "@/app/i18n";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildPreservedForLink } from "@/lib/page-params";

export type LoginState = {
  error?: "invalid_credentials" | "missing_credentials" | null;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = (formData.get("username") || "").toString().trim();
  const password = (formData.get("password") || "").toString().trim();
  const lang = normalizeLang((formData.get("lang") || "").toString());
  if (!username || !password) return { error: "missing_credentials" };

  const user = await prisma.users.findFirst({
    where: { usager: username, motpasse: password },
  });

  if (!user) return { error: "invalid_credentials" };

  await setSessionCookie(user.id);
  redirect(buildPreservedForLink("/", undefined, { lang }));
}

export async function logoutAction(formData: FormData) {
  const lang = normalizeLang((formData.get("lang") || "").toString());
  await clearSessionCookie();
  redirect(buildPreservedForLink("/", undefined, { lang }));
}
