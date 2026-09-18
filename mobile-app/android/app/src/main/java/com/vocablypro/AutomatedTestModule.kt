package com.vocablypro

import android.app.ActivityManager
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.module.annotations.ReactModule

/**
 * Tells JavaScript whether the app is currently being driven by an automated test rather than by a
 * real person.
 *
 * Google Play executes both the pre-launch report and the automated tests of the review process on
 * Firebase Test Lab devices. Every such device carries the `firebase.test.lab` system setting, which
 * is the check Google documents for recognising them, and it is set on physical and virtual devices
 * alike.
 */
@ReactModule(name = AutomatedTestModule.NAME)
class AutomatedTestModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  override fun getConstants(): MutableMap<String, Any> =
      mutableMapOf(IS_AUTOMATED_TEST_RUN to isAutomatedTestRun())

  private fun isAutomatedTestRun(): Boolean = isFirebaseTestLab() || isMonkey()

  private fun isFirebaseTestLab(): Boolean =
      try {
        "true" ==
            Settings.System.getString(
                reactApplicationContext.contentResolver, FIREBASE_TEST_LAB_SETTING)
      } catch (e: Exception) {
        false
      }

  /** Covers `adb shell monkey` runs, which some automated crawlers still use. */
  private fun isMonkey(): Boolean =
      try {
        ActivityManager.isUserAMonkey()
      } catch (e: Exception) {
        false
      }

  companion object {
    const val NAME = "VocablyAutomatedTest"
    private const val IS_AUTOMATED_TEST_RUN = "isAutomatedTestRun"
    private const val FIREBASE_TEST_LAB_SETTING = "firebase.test.lab"
  }
}
