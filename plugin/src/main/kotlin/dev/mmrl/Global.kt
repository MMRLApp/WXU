@file:Suppress("unused")

package dev.mmrl

import android.webkit.JavascriptInterface
import androidx.core.content.pm.PackageInfoCompat
import com.dergoogler.mmrl.platform.PlatformManager
import com.dergoogler.mmrl.webui.interfaces.WXInterface
import com.dergoogler.mmrl.webui.interfaces.WXOptions
import dev.mmrl.internal.WXUInterface
import dev.mmrl.internal.initFsInputStream
import dev.mmrl.internal.initFsOutputStream
import dev.mmrl.module.Dialog
import dev.mmrl.module.FileSystem
import dev.mmrl.module.Module
import dev.mmrl.module.PackageManager
import dev.mmrl.module.PackageManager.Companion.packagePathHandler
import dev.mmrl.module.Process
import dev.mmrl.module.Reflection
import dev.mmrl.module.pty.Pty
import dev.mmrl.util.getProp

class Global(wxOptions: WXOptions) : WXInterface(wxOptions) {
    private val pm get() = PlatformManager.packageManager
    private val um get() = PlatformManager.userManager

    override var name = "global"

    init {
        initFsInputStream()
        initFsOutputStream()
    }

    private val modules: List<Class<out WXUInterface>> = listOf(
        FileSystem::class.java,
        Reflection::class.java,
        Module::class.java,
        Process::class.java,
        Dialog::class.java,
        PackageManager::class.java,
        Pty::class.java
    )

    private fun meetsRequirement(code: Long): Boolean {
        // Skip
        if (code == -1L) return true

        val info = pm.getPackageInfo(context.packageName, 0, um.myUserId)
        val versionCode = PackageInfoCompat.getLongVersionCode(info)
        return versionCode >= code
    }

    @JavascriptInterface
    fun require(module: String): Any? {
        for (clazz in modules) {
            val instance =
                clazz.getDeclaredConstructor(WXOptions::class.java).newInstance(wxOptions)

            if (!meetsRequirement(instance.minVersion)) {
                console.error("The module $module requires a newer version of WebUI X to use. At least version ${instance.minVersion} is required.")
                return null
            }

            if (instance.names.any { it == module }) {
                return instance
            }

            continue
        }

        console.error("Unknown module: $module")
        return null
    }

    val isAllowUrlPackageFetchEnabled = packageManagerConfig.getProp("allowUrlPackageFetch", false)

    override val assetHandlers = buildList {
        if (isAllowUrlPackageFetchEnabled) {
            add("/.package/" to packagePathHandler())
        }
    }

    companion object {
        val WXInterface.packageManagerConfig
            get() = config.extra.getProp<Map<String, Any?>?>(
                "pm",
                null
            )
    }
}