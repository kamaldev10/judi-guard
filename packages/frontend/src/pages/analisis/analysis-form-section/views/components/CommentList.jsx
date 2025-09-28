import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import { FormattedDate } from "../../../../../lib/utils/formatters";

const CommentList = ({
  comments,
  onDeleteSingle,
  isActionInProgress,
  isLoadingInitial,
}) => {
  const handleDelete = async (commentId, commentText) => {
    try {
      await onDeleteSingle(commentId, commentText);
    } catch (error) {
      console.error(error);
      // Error already handled in parent component
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-teal-700">
        Daftar Komentar ({comments.length})
      </h3>

      {isLoadingInitial && comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mb-2" />
          <p>Memuat daftar komentar...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 bg-white p-4 rounded-xl shadow-inner">
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id || comment.youtubeCommentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`p-4 rounded-lg border-l-4 ${
                comment.classification === "JUDI"
                  ? "border-pink-500 bg-pink-50 hover:bg-pink-100"
                  : "border-blue-500 bg-blue-50 hover:bg-blue-100"
              } transition-colors duration-150 shadow-sm`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {comment.commentAuthorDisplayName || "Anonim"}
                    </span>
                    <span className="text-xs text-gray-400">
                      <FormattedDate isoDate={comment.commentPublishedAt} />
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 break-words">
                    {comment.commentTextDisplay}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(comment._id, comment.commentTextDisplay)
                  }
                  disabled={isActionInProgress}
                  aria-label="Hapus komentar"
                  className={`p-2 rounded-md ${
                    comment.classification === "JUDI"
                      ? "text-pink-600 hover:bg-pink-200"
                      : "text-gray-600 hover:bg-gray-200"
                  } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isActionInProgress ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    comment.classification === "JUDI"
                      ? "bg-pink-100 text-pink-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {comment.classification || "N/A"}
                </span>
                {comment.aiConfidenceScore && (
                  <span className="text-xs text-gray-500">
                    Kecerdasan: {Math.round(comment.aiConfidenceScore * 100)}%
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>Tidak ada komentar untuk ditampilkan</p>
        </div>
      )}
    </div>
  );
};

CommentList.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      youtubeCommentId: PropTypes.string.isRequired,
      commentAuthorDisplayName: PropTypes.string,
      commentTextDisplay: PropTypes.string.isRequired,
      commentPublishedAt: PropTypes.string.isRequired,
      classification: PropTypes.string.isRequired,
      aiConfidenceScore: PropTypes.number,
    })
  ).isRequired,
  onDeleteSingle: PropTypes.func.isRequired,
  isActionInProgress: PropTypes.bool.isRequired,
  isLoadingInitial: PropTypes.bool.isRequired,
};

export default CommentList;
