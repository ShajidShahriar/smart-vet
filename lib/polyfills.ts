// Polyfills required for pdf-parse in Next.js / Node environments
if (typeof globalThis.DOMMatrix === "undefined") {
    globalThis.DOMMatrix = class {} as any;
}
if (typeof globalThis.Path2D === "undefined") {
    globalThis.Path2D = class {} as any;
}
if (typeof globalThis.ImageData === "undefined") {
    globalThis.ImageData = class {} as any;
}
