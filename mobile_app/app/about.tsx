import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  useWindowDimensions,
} from "react-native";
import {
  ShoppingBag,
  Users,
  Award,
  TrendingUp,
  Heart,
  Shield,
} from "lucide-react-native";

const stats = [
  { label: "Products", value: "1000+", Icon: ShoppingBag },
  { label: "Happy Customers", value: "50K+", Icon: Users },
  { label: "Awards Won", value: "15+", Icon: Award },
  { label: "Years Experience", value: "10+", Icon: TrendingUp },
];

const values = [
  {
    Icon: Heart,
    title: "Customer First",
    description:
      "We prioritize our customers satisfaction above everything else. Your happiness is our success.",
  },
  {
    Icon: Shield,
    title: "Quality Guaranteed",
    description:
      "All our products are carefully selected and verified to ensure the highest quality standards.",
  },
  {
    Icon: Award,
    title: "Excellence",
    description:
      "We strive for excellence in every aspect of our business, from products to customer service.",
  },
  {
    Icon: Users,
    title: "Community",
    description:
      "Building a strong community of fashion enthusiasts who share our passion for style and quality.",
  },
];

const team = [
  {
    name: "John Smith",
    position: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
  {
    name: "Sarah Johnson",
    position: "Creative Director",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    name: "Michael Chen",
    position: "Head of Operations",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
  },
  {
    name: "Emily Davis",
    position: "Marketing Manager",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
];

const About = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <Header /> */}

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
          }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.5 }]}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <Text style={styles.heroTitle}>About Us</Text>
        <Text style={styles.heroSubtitle}>
          Redefining fashion with passion, quality, and innovation since 2014
        </Text>
      </View>

      {/* ── Our Story ── */}
      <View style={styles.section}>
        <Text style={styles.heading}>Our Story</Text>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
          }}
          style={styles.storyImage}
          resizeMode="cover"
        />
        <Text style={styles.bodyText}>
          Founded in 2014, our journey began with a simple mission: to bring
          high-quality, stylish products to fashion enthusiasts worldwide. What
          started as a small boutique has grown into a thriving e-commerce
          platform serving thousands of customers globally.
        </Text>
        <Text style={styles.bodyText}>
          We believe that fashion is more than just clothing—it's a form of
          self-expression. That's why we carefully curate every product in our
          collection, ensuring it meets our high standards for quality, style,
          and sustainability.
        </Text>
        <Text style={styles.bodyText}>
          Today, we're proud to be a leading destination for fashion-forward
          individuals who refuse to compromise on quality or style. Our
          commitment to excellence has earned us the trust and loyalty of over
          50,000 customers worldwide.
        </Text>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsBg}>
        <View style={styles.statsGrid}>
          {stats.map(({ label, value, Icon }, i) => (
            <View key={i} style={styles.statItem}>
              <View style={styles.statIconWrap}>
                <Icon size={28} color="#fff" />
              </View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Our Values ── */}
      <View style={styles.section}>
        <Text style={[styles.heading, styles.centered]}>Our Values</Text>
        <Text style={[styles.subheading, styles.centered]}>
          The principles that guide everything we do
        </Text>
        <View style={styles.valuesGrid}>
          {values.map(({ Icon, title, description }, i) => (
            <View key={i} style={styles.valueCard}>
              <View style={styles.valueIconWrap}>
                <Icon size={32} color="#fff" />
              </View>
              <Text style={styles.valueTitle}>{title}</Text>
              <Text style={styles.valueDesc}>{description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Team ── */}
      <View style={styles.teamBg}>
        <Text style={[styles.heading, styles.centered]}>Meet Our Team</Text>
        <Text style={[styles.subheading, styles.centered]}>
          The passionate people behind our success
        </Text>
        <View style={[styles.teamGrid, isWide && styles.teamGridWide]}>
          {team.map((member, i) => (
            <View
              key={i}
              style={[styles.teamCard, isWide && styles.teamCardWide]}
            >
              <Image
                source={{ uri: member.image }}
                style={styles.teamImage}
                resizeMode="cover"
              />
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamPosition}>{member.position}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Mission ── */}
      <View style={styles.section}>
        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To empower individuals to express themselves through fashion by
            providing exceptional products, outstanding service, and an
            inspiring shopping experience that celebrates diversity, creativity,
            and personal style.
          </Text>
        </View>
      </View>

      {/* ── CTA ── */}
      <View style={styles.ctaBg}>
        <Text style={[styles.heading, styles.centered]}>Join Our Journey</Text>
        <Text style={[styles.subheading, styles.centered]}>
          Be part of our growing community and discover your perfect style
        </Text>
        <View style={[styles.ctaButtons, isWide && styles.ctaButtonsRow]}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.8}
            onPress={() => Linking.openURL("/shop")}
          >
            <Text style={styles.btnPrimaryText}>Shop Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.8}
            onPress={() => Linking.openURL("/contact")}
          >
            <Text style={styles.btnSecondaryText}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <Footer /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Hero
  hero: {
    height: 280,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 32,
    lineHeight: 22,
  },

  // Generic section
  section: { paddingHorizontal: 20, paddingVertical: 36 },
  centered: { textAlign: "center" },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 14,
  },

  // Story image
  storyImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },

  // Stats
  statsBg: {
    backgroundColor: "#111827",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 24,
  },
  statItem: { width: "45%", alignItems: "center" },
  statIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: { fontSize: 14, color: "#d1d5db" },

  // Values
  valuesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  valueCard: {
    width: "47%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  valueIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  valueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  valueDesc: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 19,
  },

  // Team
  teamBg: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  teamGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  teamGridWide: { justifyContent: "space-between" },
  teamCard: { width: "47%", alignItems: "center" },
  teamCardWide: { width: "22%" },
  teamImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  teamPosition: { fontSize: 13, color: "#6b7280", textAlign: "center" },

  // Mission
  missionCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  missionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 14,
    textAlign: "center",
  },
  missionText: {
    fontSize: 15,
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 24,
  },

  // CTA
  ctaBg: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  ctaButtons: { gap: 12, width: "100%", alignItems: "center" },
  ctaButtonsRow: { flexDirection: "row", justifyContent: "center" },
  btnPrimary: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 160,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111827",
    minWidth: 160,
    alignItems: "center",
  },
  btnSecondaryText: { color: "#111827", fontWeight: "700", fontSize: 16 },
});

export default About;
