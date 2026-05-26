// ══════════════════════════════════════════════════════════════
// EmailJS Configuration — EnCo Vendor Registration
// ══════════════════════════════════════════════════════════════

window.EMAILJS_CONFIG = {
  publicKey:  'kATBKBItq7wWWLhSn',
  serviceId:  'service_j301lcu',
  templateId: 'template_tm9wmut',
};

// Initialize EmailJS
(function initEmailJS() {
  if (typeof emailjs === 'undefined') {
    console.error('❌ EmailJS SDK ไม่ได้โหลด — ตรวจสอบ CDN ใน index.html');
    return;
  }
  emailjs.init({ publicKey: window.EMAILJS_CONFIG.publicKey });
  console.log('✅ EmailJS initialized');
})();

window.isEmailJSConfigured = function () {
  return typeof emailjs !== 'undefined' && !!window.EMAILJS_CONFIG.publicKey;
};

// ส่ง notification email ผ่าน EmailJS
// ใช้ชื่อเดิม notifyAdminViaWebhook เพื่อไม่ต้องแก้ vendor.jsx
window.notifyAdminViaWebhook = async function (payload) {
  if (!window.isEmailJSConfigured()) {
    console.warn('⚠️ EmailJS ยังไม่พร้อม — ข้าม notification');
    return false;
  }
  try {
    const cfg = window.EMAILJS_CONFIG;
    await emailjs.send(cfg.serviceId, cfg.templateId, payload);
    console.log('✅ EmailJS: email sent to admin');
    return true;
  } catch (err) {
    console.error('❌ EmailJS error:', err);
    return false;
  }
};
