package com.hemantaphuyal.clicktoolspro;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen; // ✅ Required import
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // ✅ 1. Initialize the Splash Screen API 
        // This must be called BEFORE super.onCreate() to prevent the white flash
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        // ✅ 2. Create Notification Channel (Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    "default",
                    "Default Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );

            channel.setDescription("ClickTools Pro Notifications");

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}