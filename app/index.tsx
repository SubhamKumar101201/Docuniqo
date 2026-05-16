import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 25,
          }}
        >
          {/* Brand Section */}

          <View
            style={{
              alignItems: "center",
              marginTop: 60,
            }}
          >
            {/* Logo */}

            <Image
              source={require("../assets/images/logo.png")}
              style={{
                width: 110,
                height: 110,
                resizeMode: "contain",
                marginBottom: 10,
              }}
            />

            {/* Docuniqo Text */}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              {/* Docun */}

              <Text
                style={{
                  fontSize: 52,
                  fontWeight: "900",
                  color: "#04174D",
                  letterSpacing: -2,
                }}
              >
                Docun
              </Text>

              {/* Custom i */}

              <View
                style={{
                  position: "relative",
                  alignItems: "center",
                  marginHorizontal: -1,
                }}
              >
                {/* i */}

                <Text
                  style={{
                    fontSize: 52,
                    fontWeight: "900",
                    color: "#04174D",
                    lineHeight: 64,
                  }}
                >
                  i
                </Text>

                {/* Teal Dot */}

                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    width: 10,
                    height: 10,
                    borderRadius: 100,
                    backgroundColor: "#10C6C6",
                  }}
                />
              </View>

              {/* qo */}

              <Text
                style={{
                  fontSize: 52,
                  fontWeight: "900",
                  color: "#04174D",
                  letterSpacing: -2,
                }}
              >
                qo
              </Text>
            </View>

            {/* Tagline */}

            <Text
              style={{
                marginTop: 8,
                fontSize: 18,
                color: "#10C6C6",
                fontWeight: "500",
              }}
            >
              Smart Documents. Simplified.
            </Text>
          </View>

          {/* Search */}

          <TextInput
            placeholder="Search documents..."
            placeholderTextColor="#999"
            returnKeyType="search"
            style={{
              marginTop: 45,
              height: 58,
              backgroundColor: "#F8F8F8",
              borderRadius: 18,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: "#ECECEC",
              fontSize: 15,
            }}
          />

          {/* Scan Button */}

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              marginTop: 25,
              height: 62,
              backgroundColor: "#04174D",
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Scan New Document
            </Text>
          </TouchableOpacity>

          {/* Empty State */}

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#04174D",
              }}
            >
              No documents yet
            </Text>

            <Text
              style={{
                marginTop: 10,
                color: "#7B7B7B",
                fontSize: 15,
                textAlign: "center",
              }}
            >
              Scan your first document to get started
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
