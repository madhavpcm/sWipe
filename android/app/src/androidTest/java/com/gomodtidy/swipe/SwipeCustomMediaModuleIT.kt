package com.gomodtidy.swipe

import android.content.ContentValues
import android.content.Context
import android.provider.MediaStore
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
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

@RunWith(AndroidJUnit4::class) // ✅ Must run as an instrumented test
class SwipeCustomMediaModuleIT {
    private lateinit var reactContext: ReactApplicationContext
    private lateinit var imageModule: SwipeCustomMediaModule
    private val testAlbumName = "TestAlbum"
    private val insertedUris = mutableListOf<String>()


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
    }

    @After
    fun tearDown() {
        // ✅ Clean up test images
        deleteTestImages()
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
        uri?.let { insertedUris.add(it.toString()) }
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
