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
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserByClerk, updateProjectLinks, formatDate } from "../../lib/api";
import { Project } from "../../lib/types";

export default function ProjectsTab() {
  const { user: clerkUser } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [frontendUrl, setFrontendUrl] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!clerkUser?.id) return;
    try {
      const user = await getUserByClerk(clerkUser.id);
      if (user?.projects) {
        // newest first
        setProjects([...user.projects].reverse());
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

  function startEditing(project: Project) {
    setEditingProject(project.repo_name);
    setFrontendUrl(project.frontend_url || "");
    setBackendUrl(project.backend_url || "");
  }

  function cancelEditing() {
    setEditingProject(null);
    setFrontendUrl("");
    setBackendUrl("");
  }

  async function saveLinks(project: Project) {
    if (!clerkUser?.id) return;
    setSaving(true);
    try {
      await updateProjectLinks(clerkUser.id, project.repo_name, {
        frontend_url: frontendUrl || undefined,
        backend_url: backendUrl || undefined,
      });
      // Update local state
      setProjects((prev) =>
        prev.map((p) =>
          p.repo_name === project.repo_name
            ? { ...p, frontend_url: frontendUrl || undefined, backend_url: backendUrl || undefined }
            : p,
        ),
      );
      setEditingProject(null);
    } catch {
      Alert.alert("Error", "Failed to save deployment links");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  const deployed = projects.filter((p) => p.frontend_url || p.backend_url).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Projects</Text>
          <Text style={styles.subtitle}>Created from tweets</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNum}>{projects.length}</Text>
            <Text style={styles.statsLabel}>Repositories</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNum}>{deployed}</Text>
            <Text style={styles.statsLabel}>Deployed</Text>
          </View>
        </View>

        {projects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>{"</>"}</Text>
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyDesc}>
              Create a GitHub repo from any tweet in the Dashboard to get started.
            </Text>
          </View>
        ) : (
          <View style={styles.projectList}>
            {projects.map((project) => {
              const isEditing = editingProject === project.repo_name;
              return (
                <View key={project.tweet_id + project.repo_name} style={styles.projectCard}>
                  {/* Card header */}
                  <View style={styles.cardHeader}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(project.repo_url)}
                      style={styles.repoNameRow}
                    >
                      <Text style={styles.repoIcon}>{"\u2197"}</Text>
                      <Text style={styles.repoName} numberOfLines={1}>
                        {project.full_name}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.dateText}>{formatDate(project.created_at)}</Text>
                  </View>

                  {/* Tweet origin */}
                  {project.tweet_text ? (
                    <View style={styles.tweetSection}>
                      <Text style={styles.tweetLabel}>Original idea</Text>
                      <Text style={styles.tweetText} numberOfLines={3}>
                        {project.tweet_text}
                      </Text>
                      <View style={styles.tweetMeta}>
                        {project.tweet_author ? (
                          <Text style={styles.tweetAuthor}>@{project.tweet_author}</Text>
                        ) : null}
                        {project.tweet_url ? (
                          <TouchableOpacity onPress={() => Linking.openURL(project.tweet_url)}>
                            <Text style={styles.tweetLink}>View tweet {"\u2197"}</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  {/* Deployment links */}
                  <View style={styles.linksSection}>
                    <View style={styles.linksSectionHeader}>
                      <Text style={styles.linksLabel}>Deployments</Text>
                      {!isEditing && (
                        <TouchableOpacity onPress={() => startEditing(project)}>
                          <Text style={styles.editBtn}>
                            {project.frontend_url || project.backend_url ? "Edit" : "+ Add links"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditing ? (
                      <View style={styles.editForm}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Frontend URL</Text>
                          <TextInput
                            style={styles.input}
                            value={frontendUrl}
                            onChangeText={setFrontendUrl}
                            placeholder="https://myapp.vercel.app"
                            placeholderTextColor="#444"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Backend URL</Text>
                          <TextInput
                            style={styles.input}
                            value={backendUrl}
                            onChangeText={setBackendUrl}
                            placeholder="https://api.myapp.com"
                            placeholderTextColor="#444"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                          />
                        </View>
                        <View style={styles.editActions}>
                          <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={() => saveLinks(project)}
                            disabled={saving}
                          >
                            {saving ? (
                              <ActivityIndicator size="small" color="#000" />
                            ) : (
                              <Text style={styles.saveBtnText}>Save</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.linksList}>
                        {project.frontend_url ? (
                          <TouchableOpacity
                            style={styles.linkRow}
                            onPress={() => Linking.openURL(project.frontend_url!)}
                          >
                            <View style={styles.linkDot} />
                            <View style={styles.linkInfo}>
                              <Text style={styles.linkType}>Frontend</Text>
                              <Text style={styles.linkUrl} numberOfLines={1}>
                                {project.frontend_url}
                              </Text>
                            </View>
                            <Text style={styles.linkArrow}>{"\u2197"}</Text>
                          </TouchableOpacity>
                        ) : null}
                        {project.backend_url ? (
                          <TouchableOpacity
                            style={styles.linkRow}
                            onPress={() => Linking.openURL(project.backend_url!)}
                          >
                            <View style={[styles.linkDot, styles.linkDotBackend]} />
                            <View style={styles.linkInfo}>
                              <Text style={styles.linkType}>Backend</Text>
                              <Text style={styles.linkUrl} numberOfLines={1}>
                                {project.backend_url}
                              </Text>
                            </View>
                            <Text style={styles.linkArrow}>{"\u2197"}</Text>
                          </TouchableOpacity>
                        ) : null}
                        {!project.frontend_url && !project.backend_url && (
                          <Text style={styles.noLinks}>No deployment links yet</Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Action buttons */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Linking.openURL(project.repo_url)}
                    >
                      <Text style={styles.actionBtnText}>Open Repo {"\u2197"}</Text>
                    </TouchableOpacity>
                    {project.frontend_url ? (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnLive]}
                        onPress={() => Linking.openURL(project.frontend_url!)}
                      >
                        <Text style={styles.actionBtnTextLive}>Live Site {"\u2197"}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
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

  // Header
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#666", marginTop: 2 },

  // Stats
  statsGrid: { flexDirection: "row", paddingHorizontal: 14, gap: 8, marginBottom: 20 },
  statsCard: { flex: 1, backgroundColor: "#111", borderRadius: 14, padding: 16 },
  statsNum: { fontSize: 24, fontWeight: "700", color: "#fff" },
  statsLabel: { fontSize: 12, color: "#666", marginTop: 4 },

  // Empty state
  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 32, color: "#333", marginBottom: 12, fontWeight: "700" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },

  // Project list
  projectList: { paddingHorizontal: 20, gap: 12 },

  // Project card
  projectCard: { backgroundColor: "#111", borderRadius: 16, padding: 16 },

  // Card header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  repoNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  repoIcon: { fontSize: 14, color: "#666" },
  repoName: { fontSize: 15, fontWeight: "700", color: "#fff", flex: 1 },
  dateText: { fontSize: 12, color: "#555", marginLeft: 8 },

  // Tweet section
  tweetSection: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  tweetLabel: { fontSize: 11, color: "#555", fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  tweetText: { fontSize: 13, color: "#999", lineHeight: 18 },
  tweetMeta: { flexDirection: "row", gap: 12, marginTop: 8 },
  tweetAuthor: { fontSize: 12, color: "#666" },
  tweetLink: { fontSize: 12, color: "#60a5fa" },

  // Links section
  linksSection: { marginBottom: 12 },
  linksSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linksLabel: { fontSize: 11, color: "#555", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  editBtn: { fontSize: 12, color: "#60a5fa", fontWeight: "600" },

  // Links list
  linksList: { gap: 6 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  linkDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  linkDotBackend: { backgroundColor: "#a78bfa" },
  linkInfo: { flex: 1 },
  linkType: { fontSize: 11, color: "#666", fontWeight: "600" },
  linkUrl: { fontSize: 12, color: "#ccc", marginTop: 1 },
  linkArrow: { fontSize: 14, color: "#555" },
  noLinks: { fontSize: 12, color: "#444", fontStyle: "italic" },

  // Edit form
  editForm: { gap: 10 },
  inputGroup: {},
  inputLabel: { fontSize: 11, color: "#666", fontWeight: "600", marginBottom: 4 },
  input: {
    backgroundColor: "#0a0a0a",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  editActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: "#999", fontSize: 13, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#000", fontSize: 13, fontWeight: "700" },

  // Actions
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  actionBtnLive: { backgroundColor: "#052e16" },
  actionBtnTextLive: { color: "#4ade80", fontSize: 13, fontWeight: "600" },
});
