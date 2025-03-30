package com.gomodtidy.swipe

import android.app.Activity
import android.app.Instrumentation
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.intent.matcher.IntentMatchers
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import junit.framework.TestCase.assertEquals
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.mock
import org.mockito.Mockito.timeout
import org.mockito.Mockito.verify
import org.mockito.MockitoAnnotations.openMocks
import java.io.File
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

@RunWith(AndroidJUnit4::class) // ✅ Must run as an instrumented test
class SwipeCustomMediaModuleDeleteIT {

    private lateinit var reactContext: ReactApplicationContext
    private lateinit var imageModule: SwipeCustomMediaModule
    private val testAlbumName = "TestAlbum"
    private val insertedUris = mutableListOf<String>()
    private val insertedFilePaths = mutableListOf<String>()

    @Before
    fun setUp() {
        openMocks(this)
        // ✅ Use real Android Context
        val context = ApplicationProvider.getApplicationContext<Context>()
        reactContext = BridgeReactContext(context) // ✅ FIXED

        imageModule = SwipeCustomMediaModule(reactContext)

        // ✅ Insert test images
        insertTestImage("Test_Image_1.jpg")
        insertTestImage("Test_Image_2.jpg")

        // Initialize Espresso Intents for deletePhotos tests
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Intents.init()
        }
    }

    @After
    fun tearDown() {
        // ✅ Clean up test images
        deleteTestImages()

        // Release Intents after tests
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                Intents.release()
            } catch (e: Exception) {
                // Intents might not be initialized in all tests
            }
        }
    }

    @Test
    fun testCountImagesByAlbum() {
        val mockPromise = mock(Promise::class.java)
        imageModule.countImagesByAlbum(mockPromise)
        val captor = ArgumentCaptor.forClass(WritableNativeMap::class.java) //<Map<String, Int>>()
        verify(mockPromise, timeout(5000)).resolve(captor.capture())
        val result = captor.value.toHashMap()
        // ✅ Validate album count
        assertEquals(2.0, result[testAlbumName])
    }

    @Test
    fun testDeletePhotos_UserAllows() {
        // Skip if running on a device with Android version < R (11)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return
        }

        // Ensure we have file paths to delete
        if (insertedFilePaths.isEmpty()) {
            // If no file paths were stored during setup, we'll skip the test
            return
        }

        // Create a latch to wait for the async promise to resolve
        val latch = CountDownLatch(1)

        // Setup an intent result stub for when the system dialog returns
        val resultIntent = Intent()
        val result = Instrumentation.ActivityResult(Activity.RESULT_OK, resultIntent)

        // When any intent sender is launched, return our OK result
        Intents.intending(IntentMatchers.anyIntent()).respondWith(result)

        // Create a custom promise implementation that counts down the latch when resolved
        val testPromise = object : Promise {
            override fun reject(message: String) {
                throw AssertionError("Promise was rejected with: $message")

            }

            override fun reject(code: String, userInfo: WritableMap) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(code: String, message: String?) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(code: String, message: String?, userInfo: WritableMap) {
                throw AssertionError("Promise was rejected with: $code")

            }

            override fun reject(code: String, message: String?, throwable: Throwable?) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(code: String, throwable: Throwable?) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(
                code: String?,
                message: String?,
                throwable: Throwable?,
                userInfo: WritableMap?
            ) {
                throw AssertionError("Promise was rejected with: $code")
            }

            override fun reject(throwable: Throwable) {
                throw AssertionError("Promise was rejected with: ${throwable.message}")
            }

            override fun reject(throwable: Throwable, userInfo: WritableMap) {
                throw AssertionError("Promise was rejected with: ${throwable.message}")
            }

            override fun resolve(value: Any?) {
                // The promise was resolved successfully
                latch.countDown()
            }


        }

        // Create a JavaOnlyArray with test file paths
        val photosArray = JavaOnlyArray.from(insertedFilePaths)

        // Call the method under test
        imageModule.deletePhotos(photosArray, testPromise)

        // Wait for the promise to be resolved (with a timeout)
        val completed = latch.await(5, TimeUnit.SECONDS)

        // Verify the latch counted down (promise was resolved)
        assert(completed) { "Test timed out waiting for promise to resolve" }
    }

    @Test
    fun testDeletePhotos_UserDenies() {
        // Skip if running on a device with Android version < R (11)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return
        }

        // Ensure we have file paths to delete
        if (insertedFilePaths.isEmpty()) {
            // If no file paths were stored during setup, we'll skip the test
            return
        }

        // Create a latch to wait for the async promise to be rejected
        val latch = CountDownLatch(1)

        // Setup an intent result stub for when the system dialog returns
        val resultIntent = Intent()
        val result = Instrumentation.ActivityResult(Activity.RESULT_CANCELED, resultIntent)

        // When any intent sender is launched, return our CANCELED result
        Intents.intending(IntentMatchers.anyIntent()).respondWith(result)

        // Create a custom promise implementation that counts down the latch when rejected
        val testPromise = object : Promise {
            override fun resolve(value: Any?) {
                throw AssertionError("Promise was resolved but should have been rejected")
            }

            override fun reject(message: String) {
                latch.countDown()
            }

            override fun reject(code: String, userInfo: WritableMap) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(code: String, message: String?) {
                // The promise was rejected as expected
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(code: String, message: String?, userInfo: WritableMap) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(code: String, throwable: Throwable?) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(
                code: String?,
                message: String?,
                throwable: Throwable?,
                userInfo: WritableMap?
            ) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }

            override fun reject(throwable: Throwable) {
                latch.countDown()
            }

            override fun reject(throwable: Throwable, userInfo: WritableMap) {
                latch.countDown()
            }

            override fun reject(code: String, message: String?, throwable: Throwable?) {
                assert(code == "USER_CANCELLED") { "Expected USER_CANCELLED error code but got: $code" }
                latch.countDown()
            }
        }

        // Create a JavaOnlyArray with test file paths
        val photosArray = JavaOnlyArray.from(insertedFilePaths)

        // Call the method under test
        imageModule.deletePhotos(photosArray, testPromise)

        // Wait for the promise to be rejected (with a timeout)
        val completed = latch.await(5, TimeUnit.SECONDS)

        // Verify the latch counted down (promise was rejected)
        assert(completed) { "Test timed out waiting for promise to reject" }
    }

    @Test
    fun testDeletePhotos_NoValidUris() {
        // Create a latch to wait for the async promise
        val latch = CountDownLatch(1)

        // Create empty list - this should cause an early rejection
        val emptyPhotosArray = JavaOnlyArray.of()

        // Custom promise that counts down when rejected
        val testPromise = object : Promise {
            override fun resolve(value: Any?) {
                throw AssertionError("Promise was resolved but should have been rejected")
            }

            override fun reject(message: String) {
                latch.countDown()
            }

            override fun reject(code: String, userInfo: WritableMap) {
                latch.countDown()
            }

            override fun reject(code: String, message: String?) {
                assert(code == "ERROR") { "Expected ERROR code but got: $code" }
                assert(message == "No valid media URIs found for deletion") { "Unexpected error message: $message" }
                latch.countDown()
            }

            override fun reject(code: String, message: String?, userInfo: WritableMap) {
                latch.countDown()
            }

            override fun reject(code: String, throwable: Throwable?) {
                latch.countDown()
            }

            override fun reject(code: String, throwable: Throwable?, userInfo: WritableMap) {
                latch.countDown()
            }

            override fun reject(
                code: String?,
                message: String?,
                throwable: Throwable?,
                userInfo: WritableMap?
            ) {
                latch.countDown()
            }

            override fun reject(throwable: Throwable) {
                latch.countDown()
            }

            override fun reject(throwable: Throwable, userInfo: WritableMap) {
                latch.countDown()
            }

            override fun reject(code: String, message: String?, throwable: Throwable?) {
                latch.countDown()
            }

        }

        // Call the method under test
        imageModule.deletePhotos(emptyPhotosArray, testPromise)

        // Wait for the promise to be rejected (with a timeout)
        val completed = latch.await(5, TimeUnit.SECONDS)

        // Verify the latch counted down (promise was rejected)
        assert(completed) { "Test timed out waiting for promise to reject" }
    }

    private fun insertTestImage(fileName: String) {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val contentResolver = context.contentResolver

        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
            put(MediaStore.Images.Media.BUCKET_DISPLAY_NAME, testAlbumName)
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/$testAlbumName")
        }

        val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        uri?.let {
            insertedUris.add(it.toString())

            // Get the actual file path and store it for deletePhotos tests
            val filePath = getFilePathFromUri(context, it)
            if (filePath != null) {
                insertedFilePaths.add("file://$filePath")
            }
        }

        // Ensure media is scanned so it's accessible
        MediaScannerConnection.scanFile(context,
            arrayOf(File(context.getExternalFilesDir(null), "Pictures/$testAlbumName/$fileName").absolutePath),
            null, null)
    }

    private fun getFilePathFromUri(context: Context, uri: Uri): String? {
        val projection = arrayOf(MediaStore.Images.Media.DATA)
        context.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
                return cursor.getString(columnIndex)
            }
        }
        return null
    }

    private fun deleteTestImages() {
        try {
            val selectionArgs = insertedUris
                .map { it.substringAfterLast("/") }.toTypedArray()
            val contentResolver =
                InstrumentationRegistry.getInstrumentation().targetContext.contentResolver
            val selection = "${MediaStore.Images.Media._ID} IN (${selectionArgs.joinToString(",") { "?" }})"

            val rowsDeleted = contentResolver.delete(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                selection,
                selectionArgs
            )
            if (rowsDeleted == insertedUris.size) {
                // Deletion was successful
                insertedUris.clear()
                insertedFilePaths.clear()
            } else {
                // Handle the case where the file was not found in MediaStore
                println("Cleanup: insertedUrs $insertedUris, delete count $rowsDeleted." +
                        "Not all images were deleted")
            }
        } catch (ex: Exception){
            println("Cleanup Exception:")
            println(ex)
        }
    }
}