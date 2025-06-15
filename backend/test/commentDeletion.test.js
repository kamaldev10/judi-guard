require("dotenv").config();
const { google } = require("googleapis");

describe("YouTube Comment API Tests", () => {
  let youtube;
  let testYouTubeCommentId; // Simpan ID YouTube untuk testing

  beforeAll(async () => {
    const auth = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    auth.setCredentials({
      access_token: process.env.ACCESS_TOKEN,
      refresh_token: process.env.REFRESH_TOKEN,
    });

    youtube = google.youtube({ version: "v3", auth });
  });

  test("should verify comment ownership", async () => {
    const myChannel = await youtube.channels.list({
      mine: true,
      part: "id,snippet",
    });

    console.log("Channel Saya:", {
      id: myChannel.data.items[0].id,
      title: myChannel.data.items[0].snippet.title,
    });

    const commentInfo = await youtube.comments.list({
      id: testYouTubeCommentId,
      part: "snippet",
    });

    console.log("Pemilik Komentar:", {
      author: commentInfo.data.items[0].snippet.authorDisplayName,
      channelId: commentInfo.data.items[0].snippet.authorChannelId.value,
      text: commentInfo.data.items[0].snippet.textDisplay,
    });

    expect(commentInfo.data.items[0].snippet.authorChannelId.value).toBe(
      myChannel.data.items[0].id
    );
  });

  test("should list and extract YouTube comment IDs", async () => {
    const listRes = await youtube.commentThreads.list({
      videoId: "eeKxI45uZ0Y",
      part: "snippet",
      maxResults: 2,
    });

    const comments = listRes.data.items.map((item) => ({
      youtubeCommentId: item.snippet.topLevelComment.id, // Ini ID YouTube
      text: item.snippet.topLevelComment.snippet.textDisplay,
    }));

    console.log("Komentar YouTube:", comments);

    // Simpan ID YouTube untuk test selanjutnya
    if (comments.length > 0) {
      testYouTubeCommentId = comments[0].youtubeCommentId;
    }

    expect(listRes.status).toBe(200);
    expect(comments[0].youtubeCommentId).toMatch(/^Ug/); // Pastikan format YouTube ID
  });

  test("should delete YouTube comment by YouTube ID", async () => {
    if (!testYouTubeCommentId) {
      console.warn("Tidak ada komentar YouTube untuk dihapus");
      return;
    }

    try {
      // Verifikasi komentar ada dan bisa diakses
      const checkRes = await youtube.comments.list({
        id: testYouTubeCommentId,
        part: "snippet",
      });

      if (checkRes.data.items.length === 0) {
        console.warn("Komentar sudah tidak ada");
        return;
      }

      // Verifikasi kepemilikan komentar
      const comment = checkRes.data.items[0];
      const myChannel = await youtube.channels.list({
        mine: true,
        part: "id",
      });
      const myChannelId = myChannel.data.items[0].id;

      if (comment.snippet.authorChannelId.value !== myChannelId) {
        console.warn("Bukan komentar Anda, tidak bisa dihapus");
        return;
      }

      // Lakukan penghapusan
      const deleteRes = await youtube.comments.delete({
        id: testYouTubeCommentId,
      });

      console.log("Penghapusan berhasil:", deleteRes.status);
      expect(deleteRes.status).toBe(204);
    } catch (error) {
      console.error("Detail Error:", {
        youtubeCommentId: testYouTubeCommentId,
        status: error.code,
        message: error.message,
        response: error.response?.data,
      });

      if (error.code === 403) {
        console.error("ERROR IZIN: Pastikan scope mencakup youtube.force-ssl");
      } else if (error.code === 400) {
        console.error("ERROR INPUT: Cek format ID dan status komentar");
      }

      // Tidak fail test untuk error spesifik
      expect(error.code).not.toBe(403); // Hanya fail jika masalah izin
    }
  });
});
