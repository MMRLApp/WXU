package dev.mmrl.internal

import android.R.id.message
import androidx.webkit.WebMessageCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.dergoogler.mmrl.platform.file.SuFile
import com.dergoogler.mmrl.webui.interfaces.WXInterface
import dev.mmrl.util.createWebMessageListener


private val WXInterface.isFsInputStreamAllowed: Boolean get() = "wxu.permission.FS_INPUT_STREAM" in config.permissions
private val WXInterface.isFsOutputStreamAllowed: Boolean get() = "wxu.permission.FS_OUTPUT_STREAM" in config.permissions

fun WXInterface.initFsInputStream() {
    if (!isFsInputStreamAllowed || !WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
        return
    }

    createWebMessageListener("FsInputStream") fis@{
        val data: String? = message.data

        if (data == null) {
            reply.postMessage("Failed! Data was null.")
            return@fis
        }

        val file = SuFile(message.data)

        if (!file.exists()) {
            reply.postMessage("Failed! File does not exist.")
            return@fis
        }

        when (message.type) {
            WebMessageCompat.TYPE_STRING -> {
                if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_ARRAY_BUFFER)) {
                    try {
                        val bytes = file.newInputStream().use { it.readBytes() }
                        reply.postMessage(bytes)
                    } catch (e: Exception) {
                        reply.postMessage("Failed! ${e.message}")
                    }
                } else {
                    reply.postMessage("Failed! WebMessageCompat.TYPE_ARRAY_BUFFER not supported.")
                }
            }

            else -> {}
        }
    }
}

fun WXInterface.initFsOutputStream() {
    if (!isFsOutputStreamAllowed || !WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
        return
    }

    var currentPath: String? = null

    createWebMessageListener("FsOutputStream") ops@{
        when (message.type) {
            WebMessageCompat.TYPE_STRING -> {
                // Initialize the file path
                currentPath = message.data
                if (currentPath == null) {
                    reply.postMessage("Failed! Path was null.")
                    return@ops
                }

                val file = SuFile(currentPath)
                if (!file.exists()) {
                    try {
                        file.createNewFile()
                    } catch (e: Exception) {
                        reply.postMessage("Failed to create file: ${e.message}")
                        return@ops
                    }
                }

                reply.postMessage("Path set")
            }

            WebMessageCompat.TYPE_ARRAY_BUFFER -> {
                if (currentPath == null) {
                    reply.postMessage("Failed! Path not set before sending chunk.")
                    return@ops
                }

                try {
                    val bytes = message.arrayBuffer
                    val file = SuFile(currentPath)
                    file.newOutputStream(false).use { it.write(bytes) }
                    reply.postMessage("Chunk written: ${bytes.size} bytes")
                } catch (e: Exception) {
                    reply.postMessage("Failed to write chunk: ${e.message}")
                }
            }

            else -> {
                reply.postMessage("Failed! Unsupported message type: ${message.type}")
            }
        }
    }
}
