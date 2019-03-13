package com.alopexinteractiondesign.greenpass;

import com.reactnativenavigation.NavigationActivity;
import org.devio.rn.splashscreen.SplashScreen;
//import android.os.Bundle;

public class MainActivity extends NavigationActivity {

  @Override
  protected void onCreate( android.os.Bundle savedInstanceState ) {
    SplashScreen.show(this, R.style.SplashScreenTheme );
    setTheme(R.style.AppTheme);
    super.onCreate(savedInstanceState);
  }
}
