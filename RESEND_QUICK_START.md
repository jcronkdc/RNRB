# ⚡ RESEND QUICK START (5 MINUTES)

**The fastest way to get production-grade email for your magic links**

---

## 🎯 **What You'll Get**

- ✅ Instant email delivery (< 1 second)
- ✅ 3,000 free emails per month
- ✅ Emails land in inbox (not spam)
- ✅ Professional sender address
- ✅ Real-time tracking dashboard

---

## 📋 **5-MINUTE SETUP CHECKLIST**

### **[ ] Step 1: Sign Up (2 minutes)**

1. Go to: https://resend.com/signup
2. Enter email & create password
3. Verify your email

### **[ ] Step 2: Get API Key (1 minute)**

1. In Resend Dashboard, click **"API Keys"** in left sidebar
2. Click **"Create API Key"**
3. Name: `Rock N Roll Basement`
4. Click **"Add"**
5. **Copy the key** (starts with `re_`) - you'll need it in next step

### **[ ] Step 3: Configure Supabase (2 minutes)**

1. Go to: https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt/auth/templates
2. Scroll down to **"SMTP Settings"**
3. Click **"Enable Custom SMTP"**
4. Fill in these fields:

```
Sender Email:    onboarding@resend.dev
Sender Name:     Rock N' Roll Basement
Host:            smtp.resend.com
Port number:     465
Username:        resend
Password:        [Paste your Resend API key from Step 2]
```

5. Click **"Save"**
6. Click **"Send Test Email"** button
7. Check your inbox - email should arrive instantly!

### **[ ] Step 4: Test on Production (30 seconds)**

1. Go to: https://www.cronkwaters.com/auth
2. Enter your email
3. Click "Send Magic Link"
4. Check inbox (should arrive in < 5 seconds)
5. Click the magic link
6. You should be signed in! ✅

---

## ✅ **DONE! You're now using production-grade email!**

**What changed:**

- ❌ Before: Supabase default (3-4 emails/hour, unreliable)
- ✅ After: Resend (3,000/month, instant, reliable)

---

## 🎨 **OPTIONAL: Add Custom Domain (15 minutes)**

Want emails from `noreply@cronkwaters.com` instead of `onboarding@resend.dev`?

### **[ ] Step 1: Add Domain in Resend**

1. In Resend Dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter: `cronkwaters.com`
4. Resend will show you 3 DNS records to add

### **[ ] Step 2: Add DNS Records**

Go to your domain registrar (where you bought cronkwaters.com) and add these TXT records:

**Record 1 - SPF:**

```
Type: TXT
Name: @
Value: [Copy from Resend]
```

**Record 2 - DKIM:**

```
Type: TXT
Name: resend._domainkey
Value: [Copy from Resend]
```

**Record 3 - DMARC (optional):**

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

### **[ ] Step 3: Wait for Verification**

- DNS changes take 5 minutes to 24 hours
- Resend will verify automatically
- You'll get an email when it's ready

### **[ ] Step 4: Update Supabase**

Once verified, go back to Supabase SMTP settings and change:

```
Sender Email: noreply@cronkwaters.com  (instead of onboarding@resend.dev)
```

---

## 📊 **Check Your Stats**

After setup, monitor your emails in Resend Dashboard:

- Total emails sent
- Delivery rate
- Open rate (if tracking enabled)
- Recent sends

---

## 🚨 **Troubleshooting**

### **Problem: Test email not received**

**Solution:**

1. Check spam folder
2. Verify API key is correct in Supabase
3. Check Resend dashboard for error messages
4. Try a different email address

### **Problem: "Authentication failed"**

**Solution:**

1. Double-check you copied the full API key (starts with `re_`)
2. Make sure username is exactly: `resend` (lowercase)
3. Port should be `465` (not 587)

### **Problem: Emails going to spam**

**Solution:**

1. Add custom domain (see optional steps above)
2. Configure SPF/DKIM records
3. Warm up domain by sending to yourself first

---

## 💡 **Pro Tips**

1. **Keep your API key secret** - Never commit it to git
2. **Monitor your dashboard** - Watch for bounces or errors
3. **Test thoroughly** - Send test emails before announcing
4. **Set up webhooks** - Get notified of delivery/opens (optional)

---

## 📞 **Need Help?**

- **Resend Docs:** https://resend.com/docs/send-with-smtp
- **Resend Support:** support@resend.com
- **Your Supabase Project:** https://supabase.com/dashboard/project/lzfzkrylexsarpxypktt

---

## ✅ **You're All Set!**

Your magic links now use professional email infrastructure. Users will get emails instantly, in their inbox, with great deliverability.

**Total time invested:** ~5 minutes  
**Value added:** 🚀 Huge improvement in user experience

Rock on! 🎸🔥









