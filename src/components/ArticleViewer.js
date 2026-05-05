import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuration axios
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function ArticleViewer() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/articles');
      setArticles(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleDetails = async (articleId) => {
    setLoading(true);
    try {
      const [articleResponse, commentsResponse] = await Promise.all([
        api.get(`/articles/${articleId}`),
        api.get(`/comments?articleId=${articleId}`)
      ]);
      
      setSelectedArticle(articleResponse.data);
      setComments(commentsResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const response = await api.post('/comments', {
        articleId: selectedArticle.id,
        userId: 1, // ID utilisateur par défaut
        content: newComment,
        createdAt: new Date().toISOString()
      });
      
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    }
  };

  const updateArticleViews = async (articleId, currentViews) => {
    try {
      await api.patch(`/articles/${articleId}`, {
        views: currentViews + 1
      });
    } catch (err) {
      console.error('Erreur mise à jour vues:', err);
    }
  };

  const handleArticleSelect = (article) => {
    fetchArticleDetails(article.id);
    updateArticleViews(article.id, article.views);
  };

  return (
    <div className="article-viewer">
      <h1>Blog - Articles</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="articles-sidebar">
        <h2>Liste des articles</h2>
        {loading && !selectedArticle && <div>Chargement...</div>}
        
        <div className="articles-list">
          {articles.map(article => (
            <div
              key={article.id}
              className={`article-preview ${selectedArticle?.id === article.id ? 'active' : ''}`}
              onClick={() => handleArticleSelect(article)}
            >
              <h3>{article.title}</h3>
              <p>Catégorie: {article.category}</p>
              <div className="stats">
                <span>👁️ {article.views}</span>
                <span>❤️ {article.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedArticle && (
        <div className="article-content">
          <h2>{selectedArticle.title}</h2>
          <div className="article-meta">
            <span>Catégorie: {selectedArticle.category}</span>
            <span>Publié le: {new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="article-body">
            <p>{selectedArticle.content}</p>
          </div>
          
          <div className="comments-section">
            <h3>Commentaires ({comments.length})</h3>
            
            <form onSubmit={addComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows="3"
              />
              <button type="submit">Publier</button>
            </form>
            
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticleViewer;