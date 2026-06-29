import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { AUTH_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { getSupabaseAdminClient, getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import { buildGhanaPhoneCandidates, isLikelyPhone, normalizeGhanaPhone, phoneToLoginEmail } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: "Supabase auth is not configured yet." }, { status: 500 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const identifier = parsed.data.identifier.trim();
    const supabase = getSupabaseClient();
    const admin = getSupabaseAdminClient();

    let phone = identifier;
    let profileUserId: string | null = null;
    if (isLikelyPhone(identifier)) {
      const normalized = normalizeGhanaPhone(identifier);
      if (!normalized) {
        return NextResponse.json({ error: "Enter a valid Ghana mobile number." }, { status: 400 });
      }
      phone = normalized;

      const candidates = buildGhanaPhoneCandidates(phone);
      for (const candidate of candidates) {
        const normalizedCandidate = normalizeGhanaPhone(candidate);
        if (!normalizedCandidate) continue;
        const { data: profileByPhone } = await admin
          .from("profiles")
          .select("id, phone")
          .eq("phone", normalizedCandidate)
          .maybeSingle();
        if (profileByPhone?.phone) {
          phone = profileByPhone.phone;
          profileUserId = profileByPhone.id;
          break;
        }
      }
    } else {
      const { data: profile, error } = await admin
        .from("profiles")
        .select("id, phone")
        .eq("username", identifier.toLowerCase())
        .maybeSingle();

      if (error || !profile?.phone) {
        return NextResponse.json({ error: "Account not found. Check username or number." }, { status: 404 });
      }
      phone = profile.phone;
      profileUserId = profile.id;
    }

    const loginEmail = phoneToLoginEmail(phone);
    if (!loginEmail) {
      return NextResponse.json({ error: "Invalid phone format." }, { status: 400 });
    }

    if (profileUserId) {
      const authUser = await admin.auth.admin.getUserById(profileUserId);
      if (!authUser.error && authUser.data.user && !authUser.data.user.email) {
        await admin.auth.admin.updateUserById(profileUserId, {
          email: loginEmail,
          email_confirm: true,
        });
      }
    }

    let sessionData: { user: { id: string } | null } | null = null;
    let signInErrorMessage = "Invalid credentials.";

    const byEmail = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: parsed.data.password,
    });
    if (!byEmail.error && byEmail.data.user) {
      sessionData = { user: { id: byEmail.data.user.id } };
    } else {
      signInErrorMessage = byEmail.error?.message ?? signInErrorMessage;

      // Fallback for older accounts created with phone-only credentials.
      const phoneCandidates = buildGhanaPhoneCandidates(phone);
      const attempts = phoneCandidates.length > 0 ? phoneCandidates : [phone];
      for (const candidate of attempts) {
        const result = await supabase.auth.signInWithPassword({
          phone: candidate,
          password: parsed.data.password,
        });

        if (!result.error && result.data.user) {
          sessionData = { user: { id: result.data.user.id } };
          break;
        }

        signInErrorMessage = result.error?.message ?? signInErrorMessage;
      }
    }

    if (!sessionData?.user) {
      const safeMessage =
        signInErrorMessage.toLowerCase().includes("invalid login credentials") ||
        signInErrorMessage.toLowerCase().includes("invalid credentials")
          ? "Invalid credentials."
          : "Could not sign in. Please verify number/username and password.";
      return NextResponse.json({ error: safeMessage }, { status: 401 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("full_name, role, username, phone")
      .eq("id", sessionData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile setup is incomplete." }, { status: 500 });
    }

    const role = String(profile.role).toUpperCase() as "STUDENT" | "TEACHER" | "ADMIN";
    const token = signToken({ userId: sessionData.user.id, role, email: profile.phone });
    const response = NextResponse.json({
      user: {
        userId: sessionData.user.id,
        fullName: profile.full_name,
        phone: profile.phone,
        username: profile.username,
        role,
      },
    });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong while signing in." }, { status: 500 });
  }
}
