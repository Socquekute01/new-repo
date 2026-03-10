import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAuth } from "@/context/AuthContext";

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Field({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureText,
  keyboardType,
  autoCapitalize,
}: {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  secureText?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={fieldStyles.wrap}>
      <View
        style={[
          fieldStyles.row,
          focused && fieldStyles.rowFocused,
          !!error && fieldStyles.rowError,
        ]}
      >
        <Feather
          name={icon as any}
          size={16}
          color={error ? "#ef4444" : focused ? "#1a1a1a" : "#aaa"}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          secureTextEntry={secureText && !showPass}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureText && (
          <TouchableOpacity
            onPress={() => setShowPass(!showPass)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name={showPass ? "eye-off" : "eye"}
              size={16}
              color="#aaa"
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={fieldStyles.errorTxt}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  rowFocused: { borderBottomColor: "#1a1a1a" },
  rowError: { borderBottomColor: "#ef4444" },
  input: { flex: 1, fontSize: 14, color: "#1a1a1a" },
  errorTxt: { fontSize: 11, color: "#ef4444", marginTop: 3, marginLeft: 4 },
});

// ─── SOCIAL BUTTON ────────────────────────────────────────────────────────────
function SocialBtn({ icon }: { icon: string }) {
  return (
    <TouchableOpacity style={authStyles.socialBtn} activeOpacity={0.7}>
      <Feather name={icon as any} size={18} color="#555" />
    </TouchableOpacity>
  );
}

// ─── LOGIN FORM ───────────────────────────────────────────────────────────────
function LoginForm({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: (role: string) => void;
}) {
  const { login } = useAuth();
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const preventRef = useRef(false);

  const setField = (key: string) => (val: string) => {
    setData((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = async () => {
    if (preventRef.current || loading) return;
    const errs: any = {};
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(data.email)) errs.email = "Invalid email format";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      Alert.alert("Error", "Please check your login information");
      return;
    }

    try {
      setLoading(true);
      preventRef.current = true;

      // Replace with real login:
      const result = await login(data.email, data.password);

      if (result.success) {
        onSuccess(result?.data?.user?.role || "user");
      } else {
        Alert.alert("Login failed", "Invalid email or password");
        preventRef.current = false;
      }
    } catch {
      Alert.alert("Error", "An error occurred. Please try again.");
      preventRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.formContainer}>
      <Text style={authStyles.formTitle}>Sign In</Text>

      {/* Social */}
      <View style={authStyles.socialRow}>
        <SocialBtn icon="facebook" />
        <SocialBtn icon="mail" />
        <SocialBtn icon="linkedin" />
      </View>
      <Text style={authStyles.orTxt}>or use your account</Text>

      {/* Fields */}
      <Field
        icon="mail"
        placeholder="Email"
        value={data.email}
        onChangeText={setField("email")}
        error={errors.email}
        keyboardType="email-address"
      />
      <Field
        icon="lock"
        placeholder="Password"
        value={data.password}
        onChangeText={setField("password")}
        error={errors.password}
        secureText
      />

      <TouchableOpacity style={authStyles.forgotBtn}>
        <Text style={authStyles.forgotTxt}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[authStyles.submitBtn, loading && authStyles.submitBtnDisabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={authStyles.submitBtnTxt}>SIGN IN</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={authStyles.switchBtn}>
        <Text style={authStyles.switchTxt}>
          Don&apos;t have an account?{" "}
          <Text style={authStyles.switchLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const setField = (key: string) => (val: string) => {
    setData((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    const errs: any = {};
    if (!data.name.trim()) errs.name = "Name is required";
    else if (data.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(data.email)) errs.email = "Invalid email format";
    if (!data.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[0-9]{10,11}$/.test(data.phone))
      errs.phone = "Phone must be 10-11 digits";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      Alert.alert("Error", "Please check your registration information");
      return;
    }

    try {
      setLoading(true);

      // Replace with real register:
      const result = await register(
        data.name,
        data.email,
        data.phone,
        data.password,
      );
      //   await new Promise((r) => setTimeout(r, 900));
      //   const result = { success: true, message: "Registration successful!" };

      if (result.success) {
        Alert.alert("✓ Success", result.message || "Registration successful!", [
          { text: "Sign In", onPress: onSwitch },
        ]);
        setData({ name: "", email: "", phone: "", password: "" });
      } else {
        Alert.alert("Error", "Registration failed");
      }
    } catch {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.formContainer}>
      <Text style={authStyles.formTitle}>Create Account</Text>

      {/* Social */}
      <View style={authStyles.socialRow}>
        <SocialBtn icon="facebook" />
        <SocialBtn icon="mail" />
        <SocialBtn icon="linkedin" />
      </View>
      <Text style={authStyles.orTxt}>or use your email for registration</Text>

      {/* Fields */}
      <Field
        icon="user"
        placeholder="Username"
        value={data.name}
        onChangeText={setField("name")}
        error={errors.name}
        autoCapitalize="words"
      />
      <Field
        icon="mail"
        placeholder="Email"
        value={data.email}
        onChangeText={setField("email")}
        error={errors.email}
        keyboardType="email-address"
      />
      <Field
        icon="phone"
        placeholder="Phone Number"
        value={data.phone}
        onChangeText={setField("phone")}
        error={errors.phone}
        keyboardType="phone-pad"
      />
      <Field
        icon="lock"
        placeholder="Password"
        value={data.password}
        onChangeText={setField("password")}
        error={errors.password}
        secureText
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[
          authStyles.submitBtn,
          loading && authStyles.submitBtnDisabled,
          { marginTop: 16 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={authStyles.submitBtnTxt}>SIGN UP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={authStyles.switchBtn}>
        <Text style={authStyles.switchTxt}>
          Already have an account?{" "}
          <Text style={authStyles.switchLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchTo = (signup: boolean) => {
    Animated.timing(slideAnim, {
      toValue: signup ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setIsSignUp(signup);
  };

  const handleLoginSuccess = (role: string) => {
    if (role === "admin") router.replace("/admin/dashboard");
    else if (role === "manager") router.replace("/manager/dashboard");
    else if (role === "staff") router.replace("/staff/dashboard");
    else router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={authStyles.screen}
        contentContainerStyle={authStyles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={authStyles.backBtn}
        >
          <Feather name="arrow-left" size={20} color="#555" />
          <Text style={authStyles.backBtnTxt}>Back Home</Text>
        </TouchableOpacity>

        {/* ── Hero Banner */}
        <View style={authStyles.heroBanner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=70",
            }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={authStyles.heroOverlay} />
          <View style={authStyles.heroContent}>
            <Text style={authStyles.heroTitle}>
              {isSignUp ? "Join Us" : "Welcome Back!"}
            </Text>
            <Text style={authStyles.heroSubtitle}>
              {isSignUp
                ? "Enter your details and start your fashion journey."
                : "To keep shopping for trendy fashion, please sign in."}
            </Text>
          </View>
        </View>

        {/* ── Tab Switcher */}
        <View style={authStyles.tabRow}>
          <TouchableOpacity
            onPress={() => switchTo(false)}
            style={[authStyles.tab, !isSignUp && authStyles.tabActive]}
          >
            <Text
              style={[authStyles.tabTxt, !isSignUp && authStyles.tabTxtActive]}
            >
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => switchTo(true)}
            style={[authStyles.tab, isSignUp && authStyles.tabActive]}
          >
            <Text
              style={[authStyles.tabTxt, isSignUp && authStyles.tabTxtActive]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Form Card */}
        <View style={authStyles.card}>
          {isSignUp ? (
            <RegisterForm onSwitch={() => switchTo(false)} />
          ) : (
            <LoginForm
              onSwitch={() => switchTo(true)}
              onSuccess={handleLoginSuccess}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const authStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f5" },
  screenContent: { paddingBottom: 40 },

  // Back button
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtnTxt: { fontSize: 14, fontWeight: "600", color: "#555" },

  // Hero
  heroBanner: { height: 200, position: "relative", overflow: "hidden" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#e5e5e5",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabTxt: { fontSize: 14, fontWeight: "600", color: "#999" },
  tabTxtActive: { color: "#1a1a1a" },

  // Card
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Form
  formContainer: {},
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 20,
  },

  // Social
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  orTxt: { fontSize: 12, color: "#aaa", textAlign: "center", marginBottom: 18 },

  // Forgot
  forgotBtn: { alignSelf: "flex-end", marginTop: 4, marginBottom: 8 },
  forgotTxt: { fontSize: 13, color: "#555" },

  // Submit
  submitBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitBtnDisabled: { backgroundColor: "#aaa" },
  submitBtnTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // Switch
  switchBtn: { marginTop: 18, alignItems: "center" },
  switchTxt: { fontSize: 13, color: "#888" },
  switchLink: { color: "#1a1a1a", fontWeight: "700" },
});
