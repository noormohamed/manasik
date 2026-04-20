"use client";

import React, { useState } from "react";
import "./MessageComposer.css";

interface MessageComposerProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      setSending(true);
      setError(null);
      await onSendMessage(content.trim());
      setContent("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  const charCount = content.length;
  const maxChars = 5000;
  const isNearLimit = charCount > maxChars * 0.9;

  return (
    <div className="message-composer">
      {error && (
        <div className="alert alert-danger alert-sm mb-2" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="composer-input-group">
          <textarea
            className="form-control composer-textarea"
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            rows={3}
            maxLength={maxChars}
          />
          <div className="composer-footer">
            <div className="char-count">
              <small className={isNearLimit ? "text-warning" : "text-muted"}>
                {charCount} / {maxChars}
              </small>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={disabled || sending || !content.trim()}
            >
              {sending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line me-2"></i>
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <small className="text-muted d-block mt-2">
        <i className="ri-information-line me-1"></i>
        Press Ctrl+Enter to send
      </small>
    </div>
  );
};

export default MessageComposer;
