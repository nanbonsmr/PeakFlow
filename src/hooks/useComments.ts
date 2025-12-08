import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export const useComments = (articleId: string | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!articleId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription
    const channel = supabase
      .channel(`comments-${articleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `article_id=eq.${articleId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId]);

  const addComment = async (content: string) => {
    if (!user || !articleId) {
      toast.error("You must be logged in to comment");
      return false;
    }

    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: content.trim(),
      author_name: user.email?.split("@")[0] || "Anonymous",
    });

    if (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    }

    toast.success("Comment added!");
    return true;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }

    toast.success("Comment deleted");
    return true;
  };

  const updateComment = async (commentId: string, content: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ content: content.trim() })
      .eq("id", commentId);

    if (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
      return false;
    }

    toast.success("Comment updated");
    return true;
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    updateComment,
    isAuthenticated: !!user,
    currentUserId: user?.id,
  };
};
