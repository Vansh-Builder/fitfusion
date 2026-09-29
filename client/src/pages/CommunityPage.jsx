import React, { useState, useEffect } from 'react';
import { communityAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageLoader, EmptyState, Avatar } from '../components/common';
import { Heart, MessageCircle, Plus, Image, Send, Trash2, UserPlus } from 'lucide-react';
import { getImageUrl, getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image: null });
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => { loadPosts(); }, [page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await communityAPI.getPosts({ page, limit: 10 });
      setPosts(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) { toast.error('Post content required'); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('content', newPost.content);
      if (newPost.image) form.append('image', newPost.image);
      await communityAPI.createPost(form);
      toast.success('Post shared! 🎉');
      setNewPost({ content: '', image: null });
      setShowCreate(false);
      loadPosts();
    } catch { toast.error('Failed to post'); }
    setSubmitting(false);
  };

  const toggleLike = async (postId) => {
    try {
      const { data } = await communityAPI.toggleLike(postId);
      setLikedPosts(prev => {
        const next = new Set(prev);
        data.data.liked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (data.data.liked ? 1 : -1) } : p));
    } catch {}
  };

  const loadComments = async (postId) => {
    if (expandedComments.has(postId) && comments[postId]) {
      setExpandedComments(prev => { const n = new Set(prev); n.delete(postId); return n; });
      return;
    }
    try {
      const { data } = await communityAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data.data || [] }));
      setExpandedComments(prev => new Set([...prev, postId]));
    } catch {}
  };

  const addComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    try {
      await communityAPI.addComment(postId, { content });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await communityAPI.getComments(postId).then(({ data }) => {
        setComments(prev => ({ ...prev, [postId]: data.data || [] }));
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      toast.success('Comment added!');
    } catch {}
  };

  const deletePost = async (postId) => {
    try {
      await communityAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch {}
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Community 👥</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Connect, motivate, and share your journey</p>
        </div>
        <button onClick={() => setShowCreate(s => !s)} className="btn-primary">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Create post */}
      {showCreate && (
        <div className="card p-5 animate-slide-up">
          <form onSubmit={createPost}>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white font-bold shrink-0">
                {getInitials(user?.name)}
              </div>
              <textarea
                value={newPost.content}
                onChange={e => setNewPost(n => ({ ...n, content: e.target.value }))}
                placeholder="Share your fitness journey, tips, or achievements..."
                className="input-field resize-none h-24 flex-1"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-violet-500 transition-colors">
                <Image size={18} />
                <span>Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setNewPost(n => ({ ...n, image: e.target.files[0] }))} />
              </label>
              {newPost.image && <span className="text-xs text-emerald-500">📷 {newPost.image.name}</span>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'Posting...' : <><Send size={14} />Share</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Posts feed */}
      {posts.length === 0 ? (
        <EmptyState icon="💬" title="No posts yet" description="Be the first to share your fitness journey!" />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="card p-5 hover:shadow-glow-sm transition-all duration-300">
              {/* Post header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center text-white font-bold text-sm">
                    {post.author?.profile?.photo_url
                      ? <img src={getImageUrl(post.author.profile.photo_url)} alt="" className="w-full h-full rounded-xl object-cover" />
                      : getInitials(post.author?.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{post.author?.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(post.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {post.author?.id !== user?.id && (
                    <button onClick={() => communityAPI.toggleFollow(post.author.id)} className="btn-icon">
                      <UserPlus size={15} className="text-violet-500" />
                    </button>
                  )}
                  {(post.author?.id === user?.id || user?.role === 'admin') && (
                    <button onClick={() => deletePost(post.id)} className="btn-icon">
                      <Trash2 size={15} className="text-rose-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Post content */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

              {/* Post image */}
              {post.image_url && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <img src={getImageUrl(post.image_url)} alt="Post" className="w-full object-cover max-h-64" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                <button onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.has(post.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}>
                  <Heart size={16} className={likedPosts.has(post.id) ? 'fill-rose-500' : ''} />
                  <span>{post.likes_count}</span>
                </button>
                <button onClick={() => loadComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                  <MessageCircle size={16} />
                  <span>{post.comments_count}</span>
                </button>
              </div>

              {/* Comments */}
              {expandedComments.has(post.id) && (
                <div className="mt-3 space-y-3">
                  {(comments[post.id] || []).map(comment => (
                    <div key={comment.id} className="flex gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(comment.author?.name)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{comment.author?.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                      placeholder="Add a comment..."
                      className="input-field py-2 text-xs flex-1"
                    />
                    <button onClick={() => addComment(post.id)} className="btn-primary px-3 py-2 text-xs">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
