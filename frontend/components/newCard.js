import React from 'react';

const NewCard = ({ comments, pullDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Initial PR Description */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--background)',
        border: '1px solid var(--divider)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <img 
            src={pullDetails.user.avatar_url} 
            alt={pullDetails.user.login}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--divider)'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ 
                color: 'var(--aqua)', 
                fontWeight: 500 
              }}>
                {pullDetails.user.login}
              </span>
              <span style={{ 
                color: 'var(--font)', 
                fontSize: '0.875rem',
                opacity: 0.7
              }}>
                commented on {formatDate(pullDetails.created_at)}
              </span>
            </div>
            <div style={{ 
              color: 'var(--font)',
              whiteSpace: 'pre-wrap'
            }}>
              {pullDetails.body || 'No description provided.'}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      {comments.map((comment) => (
        <div 
          key={comment.id}
          style={{
            padding: '1rem',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--divider)',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <img 
              src={comment.user.avatar_url} 
              alt={comment.user.login}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--divider)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  color: 'var(--aqua)', 
                  fontWeight: 500 
                }}>
                  {comment.user.login}
                </span>
                <span style={{ 
                  color: 'var(--font)', 
                  fontSize: '0.875rem',
                  opacity: 0.7
                }}>
                  commented on {formatDate(comment.created_at)}
                </span>
              </div>
              <div style={{ 
                color: 'var(--font)',
                whiteSpace: 'pre-wrap'
              }}>
                {comment.body}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewCard;