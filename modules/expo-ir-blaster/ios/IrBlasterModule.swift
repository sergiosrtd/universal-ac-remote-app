import ExpoModulesCore

@ExpoModule("ExpoIrBlaster")
public class IrBlasterModule: Module {
  @JS
  func hasIrEmitter() -> Bool {
    false
  }

  @JS
  func transmit(frequencyHz: Double, pattern: [Double]) throws {
    throw IrUnsupported()
  }
}

struct IrUnsupported: Error, LocalizedError {
  var errorDescription: String? { "iPhones have no infrared emitter." }
}
