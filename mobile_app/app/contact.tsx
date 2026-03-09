import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── If you have a shared Header/Footer, import them here ───
// import Header from '../../src/components/header/Header';
// import Footer from '../../src/components/footer/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const openMap = () => {
    const address =
      "FPT University HCMC, Khu Công nghệ cao, Thủ Đức, Ho Chi Minh City";
    const url = Platform.select({
      ios: `maps:?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(
        `https://maps.google.com?q=${encodeURIComponent(address)}`,
      ),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header placeholder — swap with your <Header /> component */}
      {/* <Header /> */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
            }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>Contact Us</Text>
          <Text style={styles.heroSubtitle}>
            We'd love to hear from you. Get in touch with us!
          </Text>
        </View>

        <View style={styles.content}>
          {/* ── Contact Info ── */}
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <Text style={styles.sectionSubtitle}>
            Have a question or feedback? Fill out the form and we'll get back to
            you as soon as possible.
          </Text>

          <ContactInfo
            icon="mail-outline"
            title="Email"
            lines={["support@ecommerce.com", "info@ecommerce.com"]}
            onPress={() => Linking.openURL("mailto:support@ecommerce.com")}
          />
          <ContactInfo
            icon="call-outline"
            title="Phone"
            lines={["+84 123 456 789", "+84 987 654 321"]}
            onPress={() => Linking.openURL("tel:+84123456789")}
          />
          <ContactInfo
            icon="location-outline"
            title="Address"
            lines={[
              "Lô E2a-7, Đường D1, Đ. D1",
              "Khu Công nghệ cao, Thủ Đức",
              "Ho Chi Minh City, Vietnam",
            ]}
            onPress={openMap}
          />
          <ContactInfo
            icon="time-outline"
            title="Working Hours"
            lines={[
              "Monday – Friday: 9:00 AM – 6:00 PM",
              "Saturday: 10:00 AM – 4:00 PM",
              "Sunday: Closed",
            ]}
          />

          {/* ── Contact Form ── */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Send Us A Message</Text>

            {submitStatus === "success" && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#15803d" />
                <Text style={styles.successText}>
                  Thank you! Your message has been sent. We'll get back to you
                  soon.
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <FormField
                label="Your Name *"
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(v) => handleChange("name", v)}
                style={styles.halfField}
              />
              <FormField
                label="Your Email *"
                placeholder="john@example.com"
                value={formData.email}
                onChangeText={(v) => handleChange("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.halfField}
              />
            </View>

            <View style={styles.row}>
              <FormField
                label="Phone Number"
                placeholder="+84 123 456 789"
                value={formData.phone}
                onChangeText={(v) => handleChange("phone", v)}
                keyboardType="phone-pad"
                style={styles.halfField}
              />
              <FormField
                label="Subject *"
                placeholder="How can we help?"
                value={formData.subject}
                onChangeText={(v) => handleChange("subject", v)}
                style={styles.halfField}
              />
            </View>

            <FormField
              label="Message *"
              placeholder="Tell us more about your inquiry..."
              value={formData.message}
              onChangeText={(v) => handleChange("message", v)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={styles.textArea}
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
              <Text style={styles.submitBtnText}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Map Section ── */}
          <Text style={[styles.sectionTitle, styles.mapTitle]}>
            Visit Our Store
          </Text>
          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={openMap}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={48} color="#9ca3af" />
            <Text style={styles.mapText}>FPT University HCMC</Text>
            <Text style={styles.mapSubText}>Tap to open in Maps</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer placeholder — swap with your <Footer /> component */}
      {/* <Footer /> */}
    </KeyboardAvoidingView>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ContactInfo = ({ icon, title, lines, onPress }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.infoRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        {lines.map((line, i) => (
          <Text key={i} style={styles.infoLine}>
            {line}
          </Text>
        ))}
      </View>
    </Wrapper>
  );
};

const FormField = ({ label, style, multiline, ...rest }) => (
  <View style={[styles.fieldWrapper, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textAreaInput]}
      placeholderTextColor="#9ca3af"
      multiline={multiline}
      {...rest}
    />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Hero
  hero: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },

  // Layout
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // Section headings
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  mapTitle: {
    textAlign: "center",
    marginTop: 40,
    marginBottom: 16,
  },

  // Contact info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconBox: {
    backgroundColor: "#111827",
    padding: 10,
    borderRadius: 10,
    marginRight: 14,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 3,
  },
  infoLine: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 19,
  },

  // Form card
  formCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  // Success banner
  successBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    flex: 1,
    color: "#15803d",
    fontSize: 13,
    lineHeight: 18,
  },

  // Form fields
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    width: "100%",
  },
  textAreaInput: {
    height: 120,
    paddingTop: 11,
  },

  // Submit button
  submitBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Map
  mapPlaceholder: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mapText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  mapSubText: {
    fontSize: 13,
    color: "#9ca3af",
  },
});

export default Contact;
