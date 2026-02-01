# دليل بناء ملف APK للنشر

## الطريقة الأولى: استخدام EAS CLI (الموصى به)

### المتطلبات
- حساب Expo (https://expo.dev)
- EAS CLI مثبت

### الخطوات

1. **تثبيت EAS CLI**
```bash
npm install -g eas-cli
```

2. **تسجيل الدخول إلى Expo**
```bash
eas login
```

3. **بناء APK**
```bash
# بناء APK للإصدار
eas build --platform android --type apk

# أو بناء AAB (موصى به لـ Google Play)
eas build --platform android --type app-bundle
```

4. **انتظار انتهاء البناء**
- سيستغرق البناء عادة 10-15 دقيقة
- ستتلقى رابط تحميل الملف عند انتهاء البناء

## الطريقة الثانية: استخدام Expo CLI المحلي

```bash
# بناء APK محلي
expo build:android -t apk

# أو بناء AAB
expo build:android -t app-bundle
```

## الطريقة الثالثة: استخدام Android Studio (متقدم)

### المتطلبات
- Android Studio مثبت
- Java Development Kit (JDK) مثبت
- Android SDK مثبت

### الخطوات

1. **إنشاء مشروع Android**
```bash
npx create-expo-app my-app --template
cd my-app
npx expo prebuild --clean
```

2. **فتح المشروع في Android Studio**
```bash
open -a "Android Studio" android/
```

3. **بناء Release APK**
- انقر على Build → Generate Signed Bundle/APK
- اختر APK
- اختر الـ Keystore الموجود: `image-to-pdf-release.keystore`
- أدخل كلمة المرور: `manus123456`
- اختر Release
- انقر على Finish

## اختبار APK

### على جهاز فعلي

1. **تثبيت ADB**
```bash
# على macOS
brew install android-platform-tools

# على Linux
sudo apt-get install android-tools-adb
```

2. **توصيل الجهاز**
- فعّل وضع المطور على الجهاز
- فعّل USB Debugging
- وصّل الجهاز بالكمبيوتر

3. **تثبيت APK**
```bash
adb install app-release.apk
```

4. **تشغيل التطبيق**
```bash
adb shell am start -n com.example.app/.MainActivity
```

### على محاكي Android

```bash
# قائمة المحاكيات المتاحة
emulator -list-avds

# تشغيل المحاكي
emulator -avd Pixel_4_API_30

# تثبيت APK
adb install app-release.apk
```

## معلومات الحزمة

- **Package Name**: `space.manus.image.to.pdf.app.t20260131162304`
- **App Name**: Image to PDF AI Converter
- **Version**: 1.0.0
- **Min SDK**: 24
- **Target SDK**: 34

## معلومات التوقيع

- **Keystore File**: `image-to-pdf-release.keystore`
- **Keystore Password**: `manus123456`
- **Key Alias**: `image-to-pdf-key`
- **Key Password**: `manus123456`
- **Validity**: 10000 days (until 2053)

## استكشاف الأخطاء

### خطأ: "Could not find com.tom_roush:pdfbox-android"
**الحل**: تم حل هذا الخطأ بتثبيت jsPDF بدلاً من react-native-pdf-lib

### خطأ: "Gradle build failed"
**الحل**:
```bash
# تنظيف المشروع
cd android
./gradlew clean
cd ..

# إعادة بناء
eas build --platform android --type apk --clear-cache
```

### خطأ: "Invalid keystore"
**الحل**: تأكد من وجود ملف `image-to-pdf-release.keystore` في مجلد المشروع

### خطأ: "Insufficient permissions"
**الحل**: تأكد من أن لديك صلاحيات الكتابة على الجهاز

## نصائح مهمة

1. **استخدم AAB بدلاً من APK** عند النشر على Google Play (أصغر حجماً وأفضل أداء)
2. **اختبر على أجهزة حقيقية** قبل النشر
3. **احتفظ بنسخة احتياطية من الـ Keystore** - لا تفقده!
4. **استخدم نفس الـ Keystore** لجميع الإصدارات المستقبلية

## الخطوة التالية

بعد بناء APK بنجاح:
1. اختبر التطبيق على جهاز حقيقي
2. تأكد من أن جميع الميزات تعمل بشكل صحيح
3. ارفع الملف إلى Google Play Console
4. اتبع دليل النشر (PUBLISHING_GUIDE.md)
