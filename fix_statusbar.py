with open('/home/house/projects/music/android/app/src/main/java/com/house/music/MainActivity.java', 'r') as f:
    content = f.read()

old = '''            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // If we get an error loading a non-file URL, reload local assets
                if (failingUrl != null && !failingUrl.startsWith("file://")) {
                    view.loadUrl("file:///android_asset/public/index.html");
                    return;
                }
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });'''

new = '''            @Override
            public void onPageFinished(WebView view, String url) {
                // Inject CSS to compensate for status bar height so HTML content
                // doesn't render behind it when using FLAG_LAYOUT_FULLSCREEN.
                if (url != null && url.startsWith("file://")) {
                    int statusBarHeight = getStatusBarHeight();
                    String css = "body { padding-top: " + statusBarHeight + "px !important; }";
                    String js = "javascript:(function() { " +
                        "var style = document.createElement('style'); " +
                        "style.type = 'text/css'; " +
                        "style.innerHTML = '" + css.replace("'", "\\\\'") + "'; " +
                        "document.head.appendChild(style); " +
                        "})()";
                    view.evaluateJavascript(js, null);
                }
                super.onPageFinished(view, url);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // If we get an error loading a non-file URL, reload local assets
                if (failingUrl != null && !failingUrl.startsWith("file://")) {
                    view.loadUrl("file:///android_asset/public/index.html");
                    return;
                }
                super.onReceivedError(view, errorCode, description, failingUrl);
            }
        });'''

if old in content:
    content = content.replace(old, new)
    with open('/home/house/projects/music/android/app/src/main/java/com/house/music/MainActivity.java', 'w') as f:
        f.write(content)
    print('patched MainActivity')
else:
    print('pattern not found')
