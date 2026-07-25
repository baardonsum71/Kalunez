// Native-only setup. This file is dynamically imported so none of its
// dependencies get bundled/executed in the web build (see src/main.jsx).

export async function initNativeShell() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#020d1a' });
  } catch {
    // Status bar plugin not available on this platform — ignore.
  }

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    Keyboard.setResizeMode({ mode: 'body' });
  } catch {
    // Keyboard plugin not available on this platform — ignore.
  }
}
