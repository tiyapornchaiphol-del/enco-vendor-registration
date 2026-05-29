// Edge Function: create-admin-user
// Deploy via: Supabase Dashboard → Edge Functions → New Function → ชื่อ "create-admin-user"
// Built-in env vars ที่ Supabase inject ให้อัตโนมัติ:
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // ── 1. ตรวจสอบ Authorization header ──────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errorResponse(401, 'Unauthorized')

    // ── 2. สร้าง caller client ด้วย anon key + JWT ของผู้เรียก ───────────────
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // ตรวจสอบว่า caller เป็น authenticated user จริงๆ
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return errorResponse(401, 'Unauthorized: invalid session')

    // ตรวจสอบ profile ของ caller — ต้องเป็น Super Admin หรือ Procurement Admin เท่านั้น
    const { data: callerProfile, error: profileFetchErr } = await callerClient
      .from('admin_profiles')
      .select('role, is_active')
      .eq('id', caller.id)
      .single()

    if (profileFetchErr || !callerProfile?.is_active) {
      return errorResponse(403, 'Forbidden: caller is not an active admin')
    }

    const allowedRoles = ['Super Admin', 'Procurement Admin']
    if (!allowedRoles.includes(callerProfile.role)) {
      return errorResponse(403, 'Forbidden: เฉพาะ Super Admin และ Procurement Admin เท่านั้นที่สร้างผู้ใช้ได้')
    }

    // ── 3. Parse และ validate request body ───────────────────────────────────
    let body: { email?: string; name?: string; role?: string; password?: string }
    try {
      body = await req.json()
    } catch {
      return errorResponse(400, 'Invalid JSON body')
    }

    const { email, name, role, password } = body
    if (!email || !name || !role || !password) {
      return errorResponse(400, 'กรุณากรอกข้อมูลให้ครบ: email, name, role, password')
    }

    const validRoles = ['Super Admin', 'Procurement Admin', 'Reviewer', 'Read Only']
    if (!validRoles.includes(role)) {
      return errorResponse(400, `Role ไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validRoles.join(', ')}`)
    }

    if (password.length < 8) {
      return errorResponse(400, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    }

    // ── 4. สร้าง admin client ด้วย service_role key (bypass RLS) ─────────────
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // สร้าง auth user — email_confirm: true = ยืนยันอีเมลทันที ไม่ส่งอีเมล
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    })

    if (createErr) {
      console.error('createUser error:', createErr.message)
      // แปล error ให้เป็นภาษาไทยเข้าใจง่าย
      if (createErr.message.includes('already registered')) {
        return errorResponse(409, 'อีเมลนี้มีในระบบแล้ว')
      }
      return errorResponse(400, createErr.message)
    }

    // ── 5. อัปเดต admin_profiles — trigger สร้างแถวให้แล้ว ────────────────────
    // ตั้ง name, role, must_change_password = true (บังคับเปลี่ยนรหัสผ่านครั้งแรก)
    const { error: profileErr } = await adminClient
      .from('admin_profiles')
      .update({
        name: name.trim(),
        role,
        must_change_password: true,
        is_active: true,
      })
      .eq('id', newUser.user.id)

    if (profileErr) {
      console.warn('profile update warning:', profileErr.message)
      // ไม่ถือว่า error ร้ายแรง — trigger อาจสร้างแถวยังไม่เสร็จ
      // ลอง insert แทน
      await adminClient.from('admin_profiles').insert({
        id: newUser.user.id,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        role,
        must_change_password: true,
        is_active: true,
      }).onConflict('id').merge()
    }

    console.log('✅ Admin user created:', email, '| role:', role, '| by:', caller.email)

    return new Response(JSON.stringify({ ok: true, id: newUser.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (e) {
    console.error('Edge function unhandled error:', e)
    return errorResponse(500, `Server error: ${String(e)}`)
  }
})
