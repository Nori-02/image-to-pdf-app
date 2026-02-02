# دليل إعداد OAuth للتطبيق

## المشكلة

عند فتح صفحة التسجيل، تظهر رسالة خطأ:
```
Authentication failed
Missing code or state parameter
```

هذا يحدث عندما لا تكون متغيرات البيئة المطلوبة للـ OAuth مُعرّفة بشكل صحيح.

## الحل السريع (بدون OAuth)

إذا كنت تريد استخدام التطبيق بدون الحاجة لحساب:

1. **من الشاشة الرئيسية**، اضغط على زر **"استخدام بدون حساب"**
2. **أدخل اسمك والبريد الإلكتروني**
3. **اضغط "دخول"** - سيتم إنشاء جلسة محلية على جهازك

هذا الخيار يسمح لك باستخدام جميع ميزات التطبيق بدون الحاجة لحساب أو اتصال بالإنترنت.

## إعداد OAuth (للمطورين)

إذا كنت تريد تفعيل OAuth للتسجيل عبر الحساب:

### 1. الحصول على بيانات OAuth

تحتاج إلى الحصول على:
- **EXPO_PUBLIC_OAUTH_PORTAL_URL**: عنوان بوابة OAuth
- **EXPO_PUBLIC_OAUTH_SERVER_URL**: عنوان خادم OAuth
- **EXPO_PUBLIC_APP_ID**: معرّف التطبيق
- **EXPO_PUBLIC_OWNER_OPEN_ID**: معرّف المالك
- **EXPO_PUBLIC_OWNER_NAME**: اسم المالك
- **EXPO_PUBLIC_API_BASE_URL**: عنوان API الأساسي

### 2. تعريف متغيرات البيئة

#### على Expo Go (للاختبار):

أنشئ ملف `.env.local` في جذر المشروع:

```bash
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://your-oauth-portal.com
EXPO_PUBLIC_OAUTH_SERVER_URL=https://your-oauth-server.com
EXPO_PUBLIC_APP_ID=your-app-id
EXPO_PUBLIC_OWNER_OPEN_ID=your-owner-id
EXPO_PUBLIC_OWNER_NAME=Your Name
EXPO_PUBLIC_API_BASE_URL=https://3000-your-domain.com
```

#### على Google Play (للنشر):

1. انتقل إلى Google Play Console
2. اختر التطبيق
3. انتقل إلى **Settings → App signing**
4. أضف متغيرات البيئة في **Build configuration**

### 3. تكوين Deep Linking

تأكد من أن Deep Link Scheme صحيح:

```
Scheme: manus20260131162304
```

يجب أن يطابق الـ scheme المُعرّف في `app.config.ts`.

### 4. تسجيل Redirect URI

في بوابة OAuth الخاصة بك، سجّل Redirect URI:

```
manus20260131162304://oauth/callback
```

### 5. اختبار OAuth

```bash
# تشغيل التطبيق
expo start

# اضغط على "تسجيل الدخول عبر الحساب"
# يجب أن تُفتح نافذة المتصفح
# بعد التسجيل، يجب أن تعود إلى التطبيق تلقائياً
```

## استكشاف الأخطاء

### خطأ: "Missing code or state parameter"

**السبب**: متغيرات البيئة غير مُعرّفة

**الحل**:
1. تأكد من وجود ملف `.env.local`
2. تحقق من أن جميع المتغيرات معرّفة بشكل صحيح
3. أعد تشغيل التطبيق: `expo start --clear`

### خطأ: "Cannot open URL"

**السبب**: Deep Link Scheme غير صحيح

**الحل**:
1. تحقق من `app.config.ts`
2. تأكد من أن `scheme` يطابق معرّف الحزمة
3. أعد بناء التطبيق

### خطأ: "Invalid redirect URI"

**السبب**: Redirect URI غير مسجل في OAuth Portal

**الحل**:
1. سجّل Redirect URI الصحيح: `manus20260131162304://oauth/callback`
2. تأكد من عدم وجود مسافات أو أحرف غير صحيحة

### خطأ: "Session token not received"

**السبب**: الخادم لم يرد رمز الجلسة

**الحل**:
1. تحقق من أن API_BASE_URL صحيح
2. تأكد من أن الخادم يعمل بشكل صحيح
3. تحقق من سجلات الخادم للأخطاء

## متغيرات البيئة المتقدمة

### تطوير محلي

```bash
# .env.local
EXPO_PUBLIC_OAUTH_PORTAL_URL=http://localhost:3001
EXPO_PUBLIC_OAUTH_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_APP_ID=dev-app-id
EXPO_PUBLIC_OWNER_OPEN_ID=dev-owner-id
EXPO_PUBLIC_OWNER_NAME=Developer
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### الإنتاج

```bash
# .env.production
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://oauth.example.com
EXPO_PUBLIC_OAUTH_SERVER_URL=https://auth.example.com
EXPO_PUBLIC_APP_ID=prod-app-id
EXPO_PUBLIC_OWNER_OPEN_ID=prod-owner-id
EXPO_PUBLIC_OWNER_NAME=Company Name
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

## الملفات ذات الصلة

- `constants/oauth.ts` - إعدادات OAuth
- `lib/_core/auth.ts` - منطق المصادقة
- `lib/_core/api.ts` - استدعاءات API
- `app/oauth/callback.tsx` - معالج OAuth Callback
- `app/local-login-screen.tsx` - شاشة التسجيل المحلي

## الخطوات التالية

1. **للاختبار السريع**: استخدم خيار "استخدام بدون حساب"
2. **للإنتاج**: أعد تعريف متغيرات البيئة بـ OAuth الخاصة بك
3. **للدعم**: راجع سجلات الكونسول للتفاصيل الكاملة

## ملاحظات أمان

⚠️ **تحذير**: لا تحفظ متغيرات البيئة الحساسة في الكود مباشرة. استخدم دائماً:
- ملفات `.env.local` (لا تُرفع إلى Git)
- متغيرات البيئة في خادم الإنتاج
- Google Play Console Build Configuration

## الدعم

إذا واجهت مشاكل:

1. تحقق من سجلات الكونسول (اضغط على رمز العين في Expo Go)
2. راجع رسائل الخطأ بعناية
3. تأكد من اتصال الإنترنت
4. جرب إعادة تشغيل التطبيق

---

**ملخص**: إذا كنت تريد استخدام التطبيق الآن بدون OAuth، استخدم خيار "استخدام بدون حساب" من الشاشة الرئيسية!
