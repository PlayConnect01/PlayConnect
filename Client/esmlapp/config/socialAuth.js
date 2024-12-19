import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "730813875128-11hvkldvgco1nrb3ueig2kbsok77le3t.apps.googleusercontent.com",
    webClientId:
      "730813875128-11hvkldvgco1nrb3ueig2kbsok77le3t.apps.googleusercontent.com",
    expoClientId:
      "730813875128-11hvkldvgco1nrb3ueig2kbsok77le3t.apps.googleusercontent.com",
  });
  return { request, response, promptAsync };
};
