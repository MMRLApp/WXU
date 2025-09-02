package dev.mmrl.internal

class JavaScriptThrowable(
    override val message: String,
    override val cause: JavaScriptThrowable? = null,
    private val useNew: Boolean = true,
    private val useThrow: Boolean = false,
) : Throwable(message, cause) {
    fun toJsError(): String {
        val keyword = if (useNew) "new " else ""
        val escapedMessage = message.replace("'", "\\'")
        val errorString = if (cause != null) {
            "${keyword}Error('$escapedMessage', { cause: $cause })"
        } else {
            "${keyword}Error('$escapedMessage')"
        }

        return if (useThrow) "throw $errorString" else errorString
    }
}