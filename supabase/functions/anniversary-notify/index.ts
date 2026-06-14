// Supabase Edge Function — anniversary-notify (Phase 5D)
//
// Chạy daily (Supabase Dashboard → Database → Cron, hoặc pg_cron gọi qua http).
// Tìm memories được tạo đúng ngày này ở các năm trước → gửi push qua Expo Push API.
//
// Deploy:
//   supabase functions deploy anniversary-notify
// Schedule (pg_cron, chạy 9h sáng VN = 02:00 UTC mỗi ngày):
//   select cron.schedule(
//     'anniversary-notify',
//     '0 2 * * *',
//     $$ select net.http_post(
//          url := 'https://<PROJECT_REF>.supabase.co/functions/v1/anniversary-notify',
//          headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
//        ) $$
//   );

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface MemoryRow {
  id: string;
  user_id: string;
  place_name: string | null;
  created_at: string;
}

interface TokenRow {
  user_id: string;
  token: string;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: "default";
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response("Missing Supabase env", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const today = new Date();
  const month = today.getUTCMonth() + 1; // 1-12
  const day = today.getUTCDate();
  const startOfThisYear = new Date(Date.UTC(today.getUTCFullYear(), 0, 1)).toISOString();

  // Memories tạo đúng tháng/ngày này, ở năm trước (any previous year).
  const { data: memories, error } = await supabase
    .from("memories")
    .select("id, user_id, place_name, created_at")
    .filter("extract(month from created_at)", "eq", month)
    .filter("extract(day from created_at)", "eq", day)
    .lt("created_at", startOfThisYear);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = (memories ?? []) as MemoryRow[];
  if (!rows.length) {
    return new Response(JSON.stringify({ sent: 0, reason: "no anniversaries" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1 notification / user — chọn memory đầu tiên của mỗi user.
  const byUser = new Map<string, MemoryRow>();
  for (const m of rows) {
    if (!byUser.has(m.user_id)) byUser.set(m.user_id, m);
  }
  const userIds = [...byUser.keys()];

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", userIds);

  const tokensByUser = new Map<string, string[]>();
  for (const t of (tokens ?? []) as TokenRow[]) {
    const list = tokensByUser.get(t.user_id) ?? [];
    list.push(t.token);
    tokensByUser.set(t.user_id, list);
  }

  const messages: ExpoMessage[] = [];
  for (const [userId, memory] of byUser) {
    const userTokens = tokensByUser.get(userId);
    if (!userTokens?.length) continue;

    const yearsAgo = today.getUTCFullYear() - new Date(memory.created_at).getUTCFullYear();
    const when = yearsAgo === 1 ? "1 năm trước" : `${yearsAgo} năm trước`;
    const where = memory.place_name ? ` bạn ở ${memory.place_name}` : " bạn đã ghi lại một kỷ niệm";
    const body = `📍 ${when} hôm nay${where}!`;

    for (const token of userTokens) {
      messages.push({
        to: token,
        title: "Một kỷ niệm hôm nay 💭",
        body,
        data: { memoryId: memory.id, type: "anniversary" },
        sound: "default",
      });
    }
  }

  if (!messages.length) {
    return new Response(JSON.stringify({ sent: 0, reason: "no tokens" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Expo Push API nhận tối đa 100 message / request.
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });
    if (res.ok) sent += batch.length;
  }

  return new Response(JSON.stringify({ sent, users: byUser.size }), {
    headers: { "Content-Type": "application/json" },
  });
});
