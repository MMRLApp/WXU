import java.nio.ByteBuffer
import java.nio.file.Files
import java.security.KeyStore
import java.security.PrivateKey
import java.util.Properties
import java.security.Signature

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.ksp)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "dev.mmrl"
    compileSdk = 36

    defaultConfig {
        minSdk = 26
        multiDexEnabled = false
    }

    buildTypes {
        release {
            isShrinkResources = false
            multiDexEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    buildFeatures {
        compose = true
        aidl = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.13"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    packaging.resources.excludes += setOf(
        "META-INF/**",
        "okhttp3/**",
        "kotlin/**",
        "org/**",
        "**.properties",
        "**.bin",
        "**/*.proto"
    )
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.05.00")
    compileOnly(composeBom)

    compileOnly("androidx.activity:activity-compose:1.9.0")
    compileOnly("androidx.compose.ui:ui:1.6.7")
    compileOnly("androidx.compose.material3:material3:1.2.1")

    compileOnly(libs.mmrl.webui)
    compileOnly(libs.mmrl.platform)
    compileOnly(libs.mmrl.jna)

    compileOnly(libs.webkit)

    compileOnly(libs.square.retrofit.moshi)
    compileOnly(libs.square.retrofit.kotlinxSerialization)
    compileOnly(libs.square.moshi)
    ksp(libs.square.moshi.kotlin)
}

interface InjectedExecOps {
    @get:Inject
    val execOps: ExecOperations
}

val Task.injected get() = project.objects.newInstance<InjectedExecOps>()
fun Task.exec(action: Action<in ExecSpec>): ExecResult = injected.execOps.exec(action)

val androidHome: String? = System.getenv("ANDROID_HOME")
    ?: System.getenv("ANDROID_SDK_ROOT")

val isWindows = System.getProperty("os.name").lowercase().contains("win")
val isCI = System.getenv("CI") == "true"

val d8Bin = androidHome?.let {
    File(
        it,
        "build-tools/${
            android.compileSdkVersion?.replace(
                "android-",
                ""
            )
        }.0.0/d8" + if (isWindows) ".bat" else ""
    ).absolutePath
}

val adbBin = androidHome?.let {
    File(it, "platform-tools/adb" + if (isWindows) ".exe" else "").absolutePath
}

val buildDir: File = project.layout.buildDirectory.get().asFile

val classesJar =
    buildDir.resolve("intermediates/aar_main_jar/release/syncReleaseLibJars/classes.jar")
val classesOutput = buildDir.resolve("classes.dex")
val pluginName = "wxu"
val dexOutput = buildDir.resolve("$pluginName.dex")
val dexOutputSigned = buildDir.resolve("$pluginName.signed.dex")

val targetModule = "wx_pty_x"

fun Task.d8(vararg args: String) {
    if (d8Bin == null) {
        error("ANDROID_HOME or ANDROID_SDK_ROOT not set. Cannot locate d8.")
    }

    exec {
        commandLine(d8Bin, *args)
    }
}

fun Task.adb(vararg args: String) {
    if (isCI) {
        print("ADB can't run in CI environment.")
        return
    }

    if (adbBin == null) {
        error("ANDROID_HOME or ANDROID_SDK_ROOT not set. Cannot locate adb.")
    }

    exec {
        commandLine(adbBin, *args)
    }
}

fun findLatestNativeLib(libName: String, abi: String = "arm64-v8a"): File? {
    return buildDir.resolve("intermediates/cxx/Debug").walkTopDown()
        .filter {
            it.isFile &&
                    it.name == libName &&
                    (abi in it.path)
        }
        .maxByOrNull { it.lastModified() }
}

fun Task.copyAndPushNativeLibs(vararg files: File?) {
    for (file in files) {
        if (file != null) {
            val copyTo = buildDir.resolve(file.name)
            copyTo.parentFile.mkdirs()
            file.copyTo(copyTo, overwrite = true)
            println("Copied ${file.path} to: $copyTo")

            if (!isCI) {
                adb(
                    "push",
                    file.absolutePath,
                    "/data/adb/modules/$targetModule/webroot/shared/${file.name}"
                )
            }
        } else {
            println("No .so file found in intermediates.")
        }
    }
}

tasks.register("build-dex") {
    doFirst {
        classesOutput.delete()
        dexOutput.delete()
    }

    dependsOn("build")

    doLast {
        if (d8Bin == null) {
            println("Skipping build-dex: ANDROID_HOME or ANDROID_SDK_ROOT not set.")
            return@doLast
        }

        val d8File = File(d8Bin)
        if (!d8File.exists()) {
            println("Skipping build-dex: d8 not found at $d8Bin")
            return@doLast
        }

        if (!d8File.canExecute()) {
            d8File.setExecutable(true)
        }

        d8("--output", buildDir.absolutePath, classesJar.absolutePath)

        if (classesOutput.renameTo(dexOutput)) {
            println("DEX file created at: $dexOutput")

            if (!isCI) {
                println("Pushing DEX file to device...")
                adb(
                    "push",
                    dexOutput.absolutePath,
                    "/data/adb/modules/$targetModule/webroot/plugins/$pluginName.dex"
                )
            }
        }

        /*copyAndPushNativeLibs(
            findLatestNativeLib("libnative.so"),
            findLatestNativeLib("libpty.so"),
        )*/
    }
}

tasks.register("sign-dex") {
    group = "plugin"
    description = "Sign a DEX file with a JKS key"

    inputs.file(dexOutput)
    outputs.file(dexOutputSigned)

    dependsOn("build-dex")

    doLast {
        if (!hasReleaseKeyStore) {
            println("No release keystore found. Skipping signing.")
            return@doLast
        }

        val dexBytes = dexOutput.readBytes()

        // Load keystore
        val keystore = KeyStore.getInstance("JKS")
        keystore.load(releaseKeyStore.inputStream(), releaseKeyStorePassword.toCharArray())
        val privateKey =
            keystore.getKey(releaseKeyAlias, releaseKeyPassword.toCharArray()) as PrivateKey

        // Sign dex
        val signature = Signature.getInstance("SHA256withRSA")
        signature.initSign(privateKey)
        signature.update(dexBytes)
        val sigBytes = signature.sign()


        // Append format: [DEX][SIG][SIG_SIZE(4 bytes little-endian)]
        val sigSizeBytes = ByteBuffer.allocate(4).putInt(sigBytes.size).array()
        val output = dexBytes + sigBytes + sigSizeBytes

        Files.write(dexOutputSigned.toPath(), output)

        println("Signed DEX written to: ${dexOutputSigned.absolutePath}")
    }
}

private val Project.releaseKeyStore: File get() = File(extra["keyStore"] as String)
private val Project.releaseKeyStorePassword: String get() = extra["keyStorePassword"] as String
private val Project.releaseKeyAlias: String get() = extra["keyAlias"] as String
private val Project.releaseKeyPassword: String get() = extra["keyPassword"] as String
private val Project.hasReleaseKeyStore: Boolean
    get() {
        signingProperties(rootDir).forEach { key, value ->
            extra[key as String] = value
        }

        return extra.has("keyStore")
    }

private fun signingProperties(rootDir: File): Properties {
    val properties = Properties()
    val signingProperties = rootDir.resolve("signing.properties")
    if (signingProperties.isFile) {
        signingProperties.inputStream().use(properties::load)
    }

    return properties
}