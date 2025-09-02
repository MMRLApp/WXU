package dev.mmrl.util

import android.R.attr.data
import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.util.Base64
import android.webkit.WebMessage
import androidx.annotation.RequiresFeature
import androidx.annotation.UiThread
import androidx.core.graphics.createBitmap
import androidx.webkit.JavaScriptReplyProxy
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.dergoogler.mmrl.webui.interfaces.WXInterface
import com.dergoogler.mmrl.webui.moshi
import java.io.ByteArrayOutputStream


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

data class WebMessageListenerScope(
    private val wx: WXInterface,
    val message: WebMessageCompat,
    val reply: JavaScriptReplyProxy,
    val sourceOrigin: Uri,
    val isMainFrame: Boolean,
)

@UiThread
@SuppressLint("RequiresFeature")
@RequiresFeature(
    name = WebViewFeature.WEB_MESSAGE_LISTENER,
    enforcement = "androidx.webkit.WebViewFeature#isFeatureSupported"
)
fun WXInterface.createWebMessageListener(
    jsObjectName: String,
    allowedOriginRules: Set<String> = setOf(options.domain.toString()),
    block: WebMessageListenerScope.() -> Unit,
) = WebViewCompat.addWebMessageListener(
    webView,
    jsObjectName,
    allowedOriginRules
) { _, message, uri, isMainFrame, reply ->
    block(WebMessageListenerScope(this, message, reply, uri, isMainFrame))
}