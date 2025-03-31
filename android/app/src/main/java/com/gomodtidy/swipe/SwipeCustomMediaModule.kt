package com.gomodtidy.swipe

import android.app.Activity
import android.app.RecoverableSecurityException
import android.content.ContentResolver
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class SwipeCustomMediaModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    // Class variables to track requests and promises
    private val pendingPromises = mutableMapOf<String, Promise>()
    private val requestMap = mutableMapOf<Int, String>()
    private val DELETE_REQUEST_CODE = 1001

    init {
        // Register as an activity event listener
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "SwipeCustomMediaModule"
    }

    @ReactMethod
    fun countImagesByAlbum(promise: Promise) {
        try {
            val contentResolver = reactApplicationContext.contentResolver
            val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            val albumColumn = MediaStore.Images.Media.BUCKET_DISPLAY_NAME
            val projection = arrayOf(albumColumn)

            val selection = "$albumColumn IS NOT NULL"
            val sortOrder = "$albumColumn ASC"

            val results = mutableMapOf<String, Int>()

            val cursor = contentResolver.query(uri, projection, selection, null, sortOrder)
            val albumIndex = cursor?.getColumnIndex(albumColumn) ?: 0

            cursor?.use {
                if (!it.moveToFirst()) {
                    return
                }
                do {
                    val albumName = it.getString(albumIndex) ?: "Unknown"
                    results[albumName] = results.getOrDefault(albumName, 0) + 1
                } while (it.moveToNext())
            }

            promise.resolve(Arguments.makeNativeMap(results.toMap()))

        } catch (e: Exception) {
            promise.reject("ERROR_COUNTING_ALBUMS", "Failed to count images by album", e)
        }
    }

    @ReactMethod
    fun countImagesByMonthYear(promise: Promise) {
        try {
            val contentResolver = reactApplicationContext.contentResolver
            val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            val column = MediaStore.Images.Media.DATE_MODIFIED
            val projection = arrayOf(column)

            val selection = "$column IS NOT NULL"
            val sortOrder = "$column DESC"

            val results = mutableMapOf<String, Int>()
            val dateFormat = SimpleDateFormat("yyyy-MM", Locale.getDefault()) // Format timestamps

            val cursor = contentResolver.query(uri, projection, selection, null, sortOrder)
            val dateIndex = cursor?.getColumnIndex(column) ?: 0

            cursor?.use {
                it.moveToFirst()
                if(!it.moveToFirst()){
                    return
                }
                var convertToMilliSeconds = 1

                // ✅ FIX: Ensure timestamp is valid in milliseconds ( >year 2000)
                if(it.getLong(dateIndex) < 946684800000L){
                    convertToMilliSeconds=1000
                }
                do {
                    val timestamp = it.getLong(dateIndex)*convertToMilliSeconds // Get timestamp
                    if (timestamp > 0) {
                        val monthYear = dateFormat.format(Date(timestamp)) // Convert to YYYY-MM
                        results[monthYear] = results.getOrDefault(monthYear, 0) + 1
                    }
                    else{
                        println("no time stamp found for image")
                    }

                } while (it.moveToNext())
            }

            promise.resolve(Arguments.makeNativeMap(results as Map<String, Any>?))

        } catch (e: Exception) {
            promise.reject("ERROR_COUNTING_IMAGES", "Failed to count images", e)
        }
    }

    @RequiresApi(Build.VERSION_CODES.R) // Android 11+
    @ReactMethod
    fun deletePhotos(photos: ReadableArray, promise: Promise) {
        val context = reactApplicationContext
        val urisToDelete = mutableListOf<Uri>()

        // Generate a unique request ID for this deletion operation
        val requestId = UUID.randomUUID().toString()

        // Store the promise for this specific request
        pendingPromises[requestId] = promise

        for (i in 0 until photos.size()) {
            val filePath = photos.getString(i)
            if (filePath.startsWith("file://")) {
                val contentUri = getContentUriFromFilePath(context, filePath)
                if (contentUri != null) {
                    urisToDelete.add(contentUri)
                } else {
                    Log.e("SwipeCustomMediaModule", "Failed to get content URI for: $filePath")
                }
            }
        }

        if (urisToDelete.isEmpty()) {
            promise.reject("ERROR", "No valid media URIs found for deletion")
            pendingPromises.remove(requestId)
            return
        }

        try {
            val resolver = context.contentResolver
            val pendingIntent = MediaStore.createDeleteRequest(resolver, urisToDelete)
            val intentSender = pendingIntent.intentSender

            val activity = currentActivity
            if (activity != null) {
                // Store the requestId in a map keyed by activityResult requestCode
                requestMap[DELETE_REQUEST_CODE] = requestId

                activity.startIntentSenderForResult(intentSender, DELETE_REQUEST_CODE, null, 0, 0, 0)
                // Don't resolve the promise yet - it will be resolved in onActivityResult
            } else {
                promise.reject("ERROR", "Activity is null")
                pendingPromises.remove(requestId)
            }
        } catch (e: RecoverableSecurityException) {
            promise.reject("SECURITY_EXCEPTION", e.localizedMessage)
            pendingPromises.remove(requestId)
        } catch (e: Exception) {
            promise.reject("ERROR", e.localizedMessage)
            pendingPromises.remove(requestId)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == DELETE_REQUEST_CODE) {
            val requestId = requestMap[requestCode]
            if (requestId != null) {
                val promise = pendingPromises[requestId]
                if (promise != null) {
                    if (resultCode == Activity.RESULT_OK) {
                        promise.resolve("Photos deleted successfully")
                    } else {
                        promise.reject("USER_CANCELLED", "User cancelled the deletion")
                    }
                    pendingPromises.remove(requestId)
                }
                requestMap.remove(requestCode)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Not needed for this functionality
    }

    /**
     * Calculates the total size of media files grouped by their categories
     * (images, videos, audio, and documents)
     *
     * @param promise Promise to resolve with the media size information
     */
    @ReactMethod
    fun getMediaSizeByCategory(promise: Promise) {
        try {
            val contentResolver = reactApplicationContext.contentResolver
            val results = mutableMapOf<String, Long>() // Map to store category -> total size

            // Initialize size counters for each category
            results["images"] = 0L
            results["videos"] = 0L
            results["audio"] = 0L
            results["gifs"] = 0L
//            results["documents"] = 0L

            // 1. Get Images size (including GIFs)
            processMediaCategoryTotalSize(
                contentResolver,
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                arrayOf(MediaStore.Images.Media.SIZE, MediaStore.Images.Media.MIME_TYPE),
                results
            )

            // 2. Get Videos size
            processMediaCategoryTotalSize(
                contentResolver,
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                arrayOf(MediaStore.Video.Media.SIZE, MediaStore.Video.Media.MIME_TYPE),
                results
            )

            // 3. Get Audio size
            processMediaCategoryTotalSize(
                contentResolver,
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                arrayOf(MediaStore.Audio.Media.SIZE, MediaStore.Audio.Media.MIME_TYPE),
                results
            )

            // 4. Get Documents size (API 29+)
            /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                processMediaCategoryTotalSize(
                    contentResolver,
                    MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL),
                    arrayOf(MediaStore.Files.FileColumns.SIZE, MediaStore.Files.FileColumns.MIME_TYPE),
                    results,
                    "${MediaStore.Files.FileColumns.MEDIA_TYPE}=${MediaStore.Files.FileColumns.MEDIA_TYPE_DOCUMENT}"
                )
            }*/

            // Convert to WritableMap for React Native
            val writableMap = Arguments.createMap()
            for ((category, size) in results) {
                writableMap.putDouble(category, size.toDouble())
            }

            promise.resolve(writableMap)
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_MEDIA_SIZE", "Failed to get media size by category", e)
        }
    }

    /**
     * Helper function to process each media category and calculate sizes
     */
    private fun processMediaCategoryTotalSize(
        contentResolver: ContentResolver,
        uri: Uri,
        projection: Array<String>,
        results: MutableMap<String, Long>,
        selection: String? = null
    ) {
        contentResolver.query(uri, projection, selection, null, null)?.use { cursor ->
            val sizeIndex = cursor.getColumnIndex(projection[0])
            val mimeTypeIndex = cursor.getColumnIndex(projection[1])

            if (cursor.moveToFirst()) {
                do {
                    val size = cursor.getLong(sizeIndex)
                    val mimeType = cursor.getString(mimeTypeIndex) ?: ""

                    when {
                        // Handle GIFs separately
                        mimeType.contains("image/gif") -> {
                            results["gifs"] = results.getOrDefault("gifs", 0L) + size
                        }
                        // Images
                        mimeType.startsWith("image/") -> {
                            results["images"] = results.getOrDefault("images", 0L) + size
                        }
                        // Videos
                        mimeType.startsWith("video/") -> {
                            results["videos"] = results.getOrDefault("videos", 0L) + size
                        }
                        // Audio
                        mimeType.startsWith("audio/") -> {
                            results["audio"] = results.getOrDefault("audio", 0L) + size
                        }
                        // Documents (for document-specific queries)
                        uri == MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL) -> {
                            results["documents"] = results.getOrDefault("documents", 0L) + size
                        }
                    }
                } while (cursor.moveToNext())
            }
        }
    }


    private fun getContentUriFromFilePath(context: Context, filePath: String): Uri? {
        val projection = arrayOf(MediaStore.Images.Media._ID)
        val selection = MediaStore.Images.Media.DATA + "=?"
        val selectionArgs = arrayOf(filePath.replace("file://", ""))

        context.contentResolver.query(
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        projection,
                        selection,
                        selectionArgs,
                        null
                )
                ?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val id =
                                cursor.getLong(
                                        cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
                                )
                        return ContentUris.withAppendedId(
                                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                                id
                        )
                    }
                }
        return null
    }
}
