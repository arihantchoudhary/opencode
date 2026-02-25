import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserByClerk, formatDate } from "../../lib/api";
import { Project } from "../../lib/types";

export default function ProjectsTab() {
  const { user: clerkUser } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!clerkUser?.id) return;
    try {
      const user = await getUserByClerk(clerkUser.id);
      if (user?.projects) {
        setProjects(user.projects);
      }
    } catch {
      // ignore
    }
  }, [clerkUser?.id]);

  useEffect(() => {
    setLoading(true);
    loadProjects().finally(() => setLoading(false));
  }, [loadProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, [loadProjects]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>
            {projects.length} {projects.length === 1 ? "repository" : "repositories"} created from tweets
          </Text>
        </View>

        {projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⊞</Text>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyDesc}>
              Create a GitHub repo from any tweet in the Mentions tab to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.projectList}>
            {projects.map((project) => (
              <View key={project.tweet_id + project.repo_name} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(project.repo_url)}
                    style={styles.projectNameRow}
                  >
                    <Text style={styles.projectIcon}>⊞</Text>
                    <Text style={styles.projectName} numberOfLines={1}>{project.full_name}</Text>
                  </TouchableOpacity>
                  <Text style={styles.projectDate}>{formatDate(project.created_at)}</Text>
                </View>

                {project.tweet_text ? (
                  <Text style={styles.projectTweet} numberOfLines={3}>{project.tweet_text}</Text>
                ) : null}

                <View style={styles.projectMeta}>
                  {project.tweet_author ? (
                    <Text style={styles.projectAuthor}>From @{project.tweet_author}</Text>
                  ) : null}
                  {project.tweet_url ? (
                    <TouchableOpacity onPress={() => Linking.openURL(project.tweet_url)}>
                      <Text style={styles.projectLink}>🔗 View tweet</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.openRepoBtn}
                  onPress={() => Linking.openURL(project.repo_url)}
                >
                  <Text style={styles.openRepoBtnText}>⊞ Open Repo</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 2 },
  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 40, color: "#333", marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },
  projectList: { paddingHorizontal: 20, gap: 10 },
  projectCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 16,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  projectIcon: { fontSize: 16, color: "#fff" },
  projectName: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1 },
  projectDate: { fontSize: 12, color: "#555", marginLeft: 8 },
  projectTweet: { fontSize: 13, color: "#999", lineHeight: 18, marginBottom: 10 },
  projectMeta: { flexDirection: "row", gap: 12, marginBottom: 12 },
  projectAuthor: { fontSize: 12, color: "#666" },
  projectLink: { fontSize: 12, color: "#60a5fa" },
  openRepoBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  openRepoBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
