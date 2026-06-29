import fs from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path = ".env") {
  const env = {};
  const text = fs.readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL;
const anon = env.SUPABASE_ANON_KEY;
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !serviceRole) {
  console.error("Missing SUPABASE_URL/ANON/SERVICE_ROLE in .env");
  process.exit(1);
}

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const client = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const suffix = Math.floor(100000 + Math.random() * 900000);
const localPhone = `024${suffix}`;
const intlPhone = `+233${localPhone.slice(1)}`;
const username = `qa_${suffix}`;
const password = "Password123!";

console.log("Testing with:", { localPhone, intlPhone, username });

const created = await admin.auth.admin.createUser({
  phone: intlPhone,
  password,
  phone_confirm: true,
  user_metadata: {
    full_name: "QA User",
    username,
    role: "STUDENT",
  },
});

if (created.error || !created.data.user) {
  console.error("createUser failed:", created.error?.message);
  process.exit(1);
}

const userId = created.data.user.id;
const profileRes = await admin.from("profiles").insert({
  id: userId,
  full_name: "QA User",
  username,
  phone: intlPhone,
  role: "STUDENT",
});

if (profileRes.error) {
  console.error("profile insert failed:", profileRes.error.message);
  process.exit(1);
}

const byIntl = await client.auth.signInWithPassword({ phone: intlPhone, password });
console.log("signIn intl:", byIntl.error?.message ?? "ok");

const byLocal = await client.auth.signInWithPassword({ phone: localPhone, password });
console.log("signIn local:", byLocal.error?.message ?? "ok");

await admin.auth.admin.deleteUser(userId);
console.log("cleanup done");
