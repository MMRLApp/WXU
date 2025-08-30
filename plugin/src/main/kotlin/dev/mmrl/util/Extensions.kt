package dev.mmrl.util

import android.R.id.input
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import androidx.core.graphics.createBitmap
import com.dergoogler.mmrl.webui.moshi
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream


fun <T> List<T>?.toJsonString(): String {
    if (this == null) return "[]"

    val adapter = moshi.adapter(List::class.java)
    return adapter.toJson(this) ?: "[]"
}

fun getDrawableBase64(drawable: Drawable, quality: Int = 100): String {
    val bitmap = drawable.toBitmap()

    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, quality, outputStream)
    val byteArray = outputStream.toByteArray()

    return Base64.encodeToString(byteArray, Base64.NO_WRAP)
}

fun Drawable.toBitmap(): Bitmap {
    if (this is BitmapDrawable) {
        return this.bitmap
    }

    val width = this.intrinsicWidth.takeIf { it > 0 } ?: 1
    val height = this.intrinsicHeight.takeIf { it > 0 } ?: 1
    val bitmap = createBitmap(width, height)
    val canvas = Canvas(bitmap)
    this.setBounds(0, 0, canvas.width, canvas.height)
    this.draw(canvas)
    return bitmap
}

inline fun <reified T> Map<String, Any?>?.getProp(key: String, def: T): T {
    val value = this?.get(key)
    return if (value is T) {
        value
    } else {
        def
    }
}