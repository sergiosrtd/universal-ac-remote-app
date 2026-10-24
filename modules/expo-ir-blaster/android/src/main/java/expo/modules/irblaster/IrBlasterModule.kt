package expo.modules.irblaster

import android.content.Context
import android.hardware.ConsumerIrManager
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.react.androidContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@ExpoModule("ExpoIrBlaster")
class IrBlasterModule : Module() {
  private val ir: ConsumerIrManager?
    get() = androidContext.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

  @JS
  fun hasIrEmitter(): Boolean = ir?.hasIrEmitter() == true

  @JS
  suspend fun transmit(frequencyHz: Double, pattern: List<Double>) {
    val manager = ir ?: error("This phone has no infrared emitter.")
    if (!manager.hasIrEmitter()) error("This phone has no infrared emitter.")
    val timings = pattern.map { it.toInt() }.toIntArray()
    if (timings.size < 2 || timings.any { it <= 0 }) {
      error("Infrared pattern is empty or contains a non-positive duration.")
    }
    withContext(Dispatchers.IO) {
      manager.transmit(frequencyHz.toInt(), timings)
    }
  }
}
