package dev.mmrl.internal

import android.util.Log
import com.dergoogler.mmrl.webui.interfaces.WXInterface

internal class Logger(
    private val wxInterface: WXInterface,
) {
    private companion object {
        const val TAG = "WXU"
        const val JS_TAG = "[$TAG]"
    }

    private val console get() = wxInterface.console
    private val isDebug get() = wxInterface.options.debug


    fun i(msg: String, tr: JavaScriptThrowable? = null) {
        console.log("$JS_TAG:info", msg, tr?.toJsError())
        Log.i(TAG, msg, tr)
    }

    fun w(msg: String, tr: JavaScriptThrowable? = null) {
        console.warn("$JS_TAG:warn", msg, tr?.toJsError())
        Log.w(TAG, msg, tr)
    }

    fun e(msg: String, tr: JavaScriptThrowable? = null) {
        console.error("$JS_TAG:error", msg, tr?.toJsError())
        Log.e(TAG, msg, tr)
    }

    fun d(msg: String, tr: JavaScriptThrowable? = null) {
        if (isDebug) {
            console.log("$JS_TAG:debug", msg, tr?.toJsError())
            Log.d(TAG, msg, tr)
        }
    }

    fun v(msg: String, tr: JavaScriptThrowable? = null) {
        if (isDebug) {
            console.log("$JS_TAG:verbose", msg, tr?.toJsError())
            Log.v(TAG, msg, tr)
        }
    }

    fun wtf(msg: String, tr: JavaScriptThrowable? = null) {
        console.error("$JS_TAG:wtf", msg, tr?.toJsError())
        Log.wtf(TAG, msg, tr)
    }
}

internal val WXInterface.log get() = Logger(this)