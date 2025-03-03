import React, {useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';

const ReCaptcha = ({siteKey, baseUrl, onVerify}) => {
  const webViewRef = useRef(null);

  const captchaHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          .g-recaptcha {
            transform: scale(2.5); /* Scale the captcha */
            transform-origin: 0 1; /* Keep scaling aligned to top-left */
            margin: 0 auto; /* Center align inside the container */
          }
            iframe {
            transform: scale(1); /* Scale the challenge popup */
            transform-origin: center; /* Ensure scaling aligns properly */
          }
          body {
            display: flex;
            justify-content: center;
            height: 100%;
            margin: 0;
            margin-top:80px;
            background-color: transparent;
          }
        </style>
        <script>
          function onRecaptchaSuccess(token) {
            window.ReactNativeWebView.postMessage(token);
          }
        </script>
      </head>
      <body>
        <div
          class="g-recaptcha"
          data-sitekey="${siteKey}"
          data-callback="onRecaptchaSuccess">
        </div>
      </body>
    </html>
  `;

  const handleMessage = event => {
    const token = event.nativeEvent.data;
    if (onVerify) {
      onVerify(token); // Pass the token back to the parent
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{html: captchaHtml, baseUrl}}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200, // Adjust height to ensure the captcha fits perfectly
    width: Dimensions.get('window').width - 20, // Match input field width
    alignSelf: 'center', // Center the captcha horizontally
    marginTop: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ReCaptcha;
