package dev.mmrl.module

import android.view.ViewGroup
import android.webkit.JavascriptInterface
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.window.DialogProperties
import com.dergoogler.mmrl.webui.interfaces.WXOptions
import dev.mmrl.internal.WXUInterface

class Dialog(wxOptions: WXOptions) : WXUInterface(wxOptions) {
    override var name = "dialog"

    @JavascriptInterface
    fun show() {
        val act = activity
        if (act == null) return

        post {
            act.addContentView(
                ComposeView(act).apply {
                    setContent {
                        var showDialog by remember { mutableStateOf(true) }

                        if (showDialog) {
                            AlertDialog(
                                onDismissRequest = { showDialog = false },
                                confirmButton = {
                                    TextButton(onClick = { showDialog = false }) {
                                        Text("OK")
                                    }
                                },
                                dismissButton = {
                                    TextButton(onClick = { showDialog = false }) {
                                        Text("Cancel")
                                    }
                                },
                                title = {
                                    Text("Dialog Title")
                                },
                                text = {
                                    Text("This is a simple Material 3 alert dialog.")
                                },
                                properties = DialogProperties(dismissOnClickOutside = true)
                            )
                        }
                    }
                },
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )
        }
    }
}