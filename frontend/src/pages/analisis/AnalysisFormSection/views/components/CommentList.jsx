// src/features/video-analysis/views/components/CommentList.jsx
import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { FormattedDate } from "../../../../../utils/formatters"; // Sesuaikan path

/**
 * Menampilkan daftar komentar yang telah dianalisis.
 * @param {object} props
 * @param {Array} props.comments - Array dari komentar yang akan ditampilkan.
 * @param {Function} props.onDeleteSingle - Handler untuk menghapus satu komentar.
 * @param {boolean} props.isActionInProgress - Status loading.
 * @param {boolean} props.isLoadingInitial - Status loading saat komentar pertama kali diambil.
 */
const CommentList = ({
  comments,
  onDeleteSingle,
  isActionInProgress,
  isLoadingInitial,
}) => {
  return (
    <div>
      <h3 className="text-md font-semibold text-teal-700 mb-4 mt-6">
        Daftar Komentar ({comments.length}):
      </h3>
      {isLoadingInitial && comments.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Loader2
              className="animate-spin inline-block mr-2 text-teal-600"
              size={24}
            />{" "}
            Memuat daftar komentar...
          </motion.div>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 bg-white p-3 md:p-4 rounded-xl shadow-inner">
          {comments.map((comment, index) => (
            <motion.div
              key={comment._id || comment.youtubeCommentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-3 rounded-lg shadow-md border-l-4 ${
                comment.classification === "JUDI"
                  ? "border-pink-500 bg-pink-50 hover:bg-pink-100"
                  : "border-blue-500 bg-blue-50 hover:bg-blue-100"
              } transition-colors duration-150`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 mr-2 min-w-0">
                  <p className="text-xs text-gray-500 truncate">
                    <strong>
                      {comment.commentAuthorDisplayName || "Anonim"}
                    </strong>{" "}
                    - <FormattedDate isoDate={comment.commentPublishedAt} />
                  </p>
                  <p className="text-sm text-gray-800 mt-1 break-words">
                    {comment.commentTextDisplay}
                  </p>
                </div>
                {/* Tombol hapus "hidden" sementara */}
                <button
                  type="button"
                  onClick={() =>
                    onDeleteSingle(comment._id, comment.commentTextDisplay)
                  }
                  disabled={isActionInProgress}
                  title="Hapus komentar ini dari YouTube"
                  className={`hidden p-1.5 rounded-md text-xs whitespace-nowrap ${
                    comment.classification === "JUDI"
                      ? "bg-pink-500 hover:bg-pink-600"
                      : "bg-gray-400 hover:bg-gray-500"
                  } text-white transition-colors disabled:opacity-50`}
                >
                  Hapus
                </button>
              </div>
              <p
                className={`mt-2 text-xs font-semibold ${
                  comment.classification === "JUDI"
                    ? "text-pink-600"
                    : "text-blue-600"
                }`}
              >
                Kategori: {comment.classification || "N/A"}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        !isLoadingInitial && (
          <p className="text-gray-600 text-center py-10">
            Tidak ada komentar untuk ditampilkan.
          </p>
        )
      )}
    </div>
  );
};

CommentList.propTypes = {
  comments: PropTypes.array.isRequired,
  onDeleteSingle: PropTypes.func.isRequired,
  isActionInProgress: PropTypes.bool.isRequired,
  isLoadingInitial: PropTypes.bool.isRequired,
};

export default CommentList;
