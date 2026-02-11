# Capacitor Core
# Prevents ProGuard from stripping the bridge that connects JS to Native
-keep class com.getcapacitor.** { *; }
-keep  class com.google.firebase.** { *; }

# Google Play Integrity API
# Essential for the integrity check to verify the device and app binary
-keep class com.google.android.play.core.integrity.** { *; }
-keep class com.google.android.play.core.common.** { *; }

# Preserve Line Numbers for Debugging
# This helps you read crash reports in the Play Console (Firebase Crashlytics)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# WebKit / WebView
# Required for the Capacitor WebView to function correctly
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Lucide Icons / React components 
# If you use any reflection-based serialization, keep those models here:
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }