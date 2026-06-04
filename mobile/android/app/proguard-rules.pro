# Add project specific ProGuard rules here.
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# React Native
-keep,allowobfuscation @interface com.facebook.react.bridge.ReadableType
-keepclassmembers class * implements com.facebook.react.bridge.ReadableType { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Disable logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
