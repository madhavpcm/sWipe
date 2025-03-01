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

class DeleteMediaModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "DeleteMedia"
    }

    @RequiresApi(Build.VERSION_CODES.R) // Android 11+
    @ReactMethod
    fun deletePhotos(photos: ReadableArray, promise: Promise) {
        val context = reactApplicationContext
        val urisToDelete = mutableListOf<Uri>()

        for (i in 0 until photos.size()) {
            val filePath = photos.getString(i)
            if (filePath != null && filePath.startsWith("file://")) {
                val contentUri = getContentUriFromFilePath(context, filePath)
                if (contentUri != null) {
                    urisToDelete.add(contentUri)
                } else {
                    Log.e("DeleteMediaModule", "Failed to get content URI for: $filePath")
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
