import Foundation
import CoreText
import CoreGraphics

// Generate vector lettering using the locally licensed font. No font is embedded.
let phrase = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "PICORUNNER"
let font = CTFontCreateWithName("Arial-Black" as CFString, 128, nil)
let attributes: [NSAttributedString.Key: Any] = [
  NSAttributedString.Key(kCTFontAttributeName as String): font,
  NSAttributedString.Key(kCTKernAttributeName as String): -4.5,
]
let line = CTLineCreateWithAttributedString(NSAttributedString(string: phrase, attributes: attributes))
let combined = CGMutablePath()
for runValue in CTLineGetGlyphRuns(line) as! [CTRun] {
  let count = CTRunGetGlyphCount(runValue)
  var glyphs = [CGGlyph](repeating: 0, count: count)
  var positions = [CGPoint](repeating: .zero, count: count)
  CTRunGetGlyphs(runValue, CFRange(location: 0, length: 0), &glyphs)
  CTRunGetPositions(runValue, CFRange(location: 0, length: 0), &positions)
  for i in 0..<count {
    if let path = CTFontCreatePathForGlyph(font, glyphs[i], nil) {
      combined.addPath(path, transform: CGAffineTransform(translationX: positions[i].x, y: positions[i].y))
    }
  }
}
let box = combined.boundingBoxOfPath
let translated = CGMutablePath()
translated.addPath(combined, transform: CGAffineTransform(a: 1, b: 0, c: 0, d: -1, tx: -box.minX, ty: box.maxY))
func point(_ p: CGPoint) -> String { String(format: "%.3f %.3f", p.x, p.y) }
var commands: [String] = []
translated.applyWithBlock { raw in
  let e = raw.pointee
  switch e.type {
  case .moveToPoint: commands.append("M" + point(e.points[0]))
  case .addLineToPoint: commands.append("L" + point(e.points[0]))
  case .addQuadCurveToPoint: commands.append("Q" + point(e.points[0]) + " " + point(e.points[1]))
  case .addCurveToPoint: commands.append("C" + point(e.points[0]) + " " + point(e.points[1]) + " " + point(e.points[2]))
  case .closeSubpath: commands.append("Z")
  @unknown default: break
  }
}
let output: [String: Any] = ["width": box.width, "height": box.height, "path": commands.joined(separator: " "), "font": CTFontCopyPostScriptName(font)]
let data = try JSONSerialization.data(withJSONObject: output, options: [.sortedKeys])
print(String(data: data, encoding: .utf8)!)
