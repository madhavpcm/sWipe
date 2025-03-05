package com.gomodtidy.swipe

import android.app.RecoverableSecurityException
import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SwipeCustomMediaModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SwipeCustomMediaModule"
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

    @ReactMethod
    fun countImagesBetweenTimestamps(startTime: Double, endTime: Double, promise: Promise) {
        try {
            val contentResolver = reactApplicationContext.contentResolver
            val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
            val projection = arrayOf("COUNT(*)")
            val selection = "${MediaStore.Images.Media.DATE_ADDED} BETWEEN ? AND ?"
            val selectionArgs = arrayOf((startTime / 1000).toString(), (endTime / 1000).toString())

            contentResolver.query(uri, projection, selection, selectionArgs, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    promise.resolve(cursor.getInt(0)) // Return count to React Native
                    return
                }
            }
            promise.resolve(0) // No images found
        } catch (e: Exception) {
            promise.reject("ERROR_COUNTING_IMAGES", "Failed to count images", e)
        }
    }

    @RequiresApi(Build.VERSION_CODES.R) // Android 11+
    @ReactMethod
    fun deletePhotos(photos: ReadableArray, promise: Promise) {
        val context = reactApplicationContext
        val urisToDelete = mutableListOf<Uri>()

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
            return
        }

        try {
            val resolver = context.contentResolver
            val pendingIntent = MediaStore.createDeleteRequest(resolver, urisToDelete)
            val intentSender = pendingIntent.intentSender

            val activity = currentActivity
            if (activity != null) {
                activity.startIntentSenderForResult(intentSender, 1001, null, 0, 0, 0)
                promise.resolve("Delete request sent")
            } else {
                promise.reject("ERROR", "Activity is null")
            }
        } catch (e: RecoverableSecurityException) {
            promise.reject("SECURITY_EXCEPTION", e.localizedMessage)
        } catch (e: Exception) {
            promise.reject("ERROR", e.localizedMessage)
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
